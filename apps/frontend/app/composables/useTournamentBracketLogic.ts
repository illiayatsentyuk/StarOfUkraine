import { ref, watch } from 'vue'
import { useTournamentBracket } from '../stores/tournamentBrackets.store'

export function useTournamentBracketLogic(tournamentId: string) {
  const bracketStore = useTournamentBracket()
  const bracketRounds = ref<any[]>([])

  // Persistence
  watch(bracketRounds, (newVal) => {
    if (newVal && newVal.length > 0) {
      localStorage.setItem(`bracket_${tournamentId}`, JSON.stringify(newVal))
    }
  }, { deep: true })

  function initRoundsFromTournament(tournament: any) {
    if (!tournament) return
    
    const saved = localStorage.getItem(`bracket_${tournamentId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) {
          bracketRounds.value = parsed
          return
        }
      } catch (e) {
        console.error('Failed to parse saved bracket')
      }
    }

    const r = tournament.rounds
    if (Array.isArray(r) && r.length > 0) {
      bracketRounds.value = r
    }
  }

  function generateBracket(teams: any[]) {
    if (!teams || teams.length === 0) return

    let numTeams = teams.length
    let bracketSize = 1
    while (bracketSize < numTeams) bracketSize *= 2

    const generatedRounds = []
    
    // Round 1
    const firstRoundMatches = []
    for (let i = 0; i < bracketSize / 2; i++) {
      const t1 = teams[i * 2]
      const t2 = teams[i * 2 + 1]

      firstRoundMatches.push({
        id: `round1_match${i + 1}`,
        title: String(i + 1),
        winner: null,
        team1: t1 ? {
          id: t1.id,
          name: t1.name || t1.teamName || 'Без назви',
          score: null,
        } : { id: null, name: 'BYE', score: null },
        team2: t2 ? {
          id: t2.id,
          name: t2.name || t2.teamName || 'Без назви',
          score: null,
        } : { id: null, name: 'BYE', score: null },
      })
    }
    generatedRounds.push({ matchs: firstRoundMatches })

    // Next rounds
    let currentMatchesCount = bracketSize / 2
    let roundNum = 2
    while (currentMatchesCount > 1) {
      currentMatchesCount /= 2
      const matches = []
      for (let i = 0; i < currentMatchesCount; i++) {
        matches.push({
          id: `round${roundNum}_match${i + 1}`,
          title: `${roundNum}-${i + 1}`,
          winner: null,
          team1: { id: null, name: "TBD", score: null },
          team2: { id: null, name: "TBD", score: null },
        })
      }
      generatedRounds.push({ matchs: matches })
      roundNum++
    }

    bracketRounds.value = generatedRounds
  }

  function getMatchRef(matchId: string) {
    for (let ri = 0; ri < bracketRounds.value.length; ri++) {
      const round = bracketRounds.value[ri]
      for (let mi = 0; mi < (round?.matchs?.length || 0); mi++) {
        const match = round.matchs[mi]
        if (String(match.id) === String(matchId)) {
          return { match, roundIdx: ri, matchIdx: mi }
        }
      }
    }
    return null
  }

  function propagateWinner(roundIdx: number, matchIdx: number, winnerTeam: any) {
    const nextRound = bracketRounds.value[roundIdx + 1]
    if (!nextRound?.matchs?.length || !winnerTeam) return

    const nextMatchIdx = Math.floor(matchIdx / 2)
    const slot = matchIdx % 2 === 0 ? 'team1' : 'team2'
    const nextMatch = nextRound.matchs[nextMatchIdx]
    if (!nextMatch) return

    nextMatch[slot] = {
      id: winnerTeam.id,
      name: winnerTeam.name,
      score: null,
      side: null,
    }
  }

  function resolveScoreBySide(team: any, fallback: number, radiantScore: number, direScore: number) {
    if (team?.side === 'radiant') return radiantScore
    if (team?.side === 'dire') return direScore
    return fallback
  }

  async function applyDotaResultToMatch(matchId: string, dotaId: string) {
    const found = getMatchRef(matchId)
    if (!found) return

    try {
      const data = await bracketStore.fetchMatchData(dotaId)
      if (!data) return

      const { match, roundIdx, matchIdx } = found
      const radiantScore = Number(data.radiant_score) || 0
      const direScore = Number(data.dire_score) || 0

      const t1Score = resolveScoreBySide(match.team1, radiantScore, radiantScore, direScore)
      const t2Score = resolveScoreBySide(match.team2, direScore, radiantScore, direScore)

      match.team1 = { ...match.team1, score: t1Score }
      match.team2 = { ...match.team2, score: t2Score }

      let winnerTeam = null
      if (t1Score > t2Score) winnerTeam = match.team1
      else if (t2Score > t1Score) winnerTeam = match.team2
      else {
        if (match.team1?.side === 'radiant' && data.radiant_win) winnerTeam = match.team1
        else if (match.team2?.side === 'radiant' && data.radiant_win) winnerTeam = match.team2
        else if (match.team1?.side === 'dire' && !data.radiant_win) winnerTeam = match.team1
        else if (match.team2?.side === 'dire' && !data.radiant_win) winnerTeam = match.team2
        else winnerTeam = data.radiant_win ? match.team1 : match.team2
      }

      match.winner = winnerTeam?.id ?? null
      match.dotaMatchId = dotaId

      propagateWinner(roundIdx, matchIdx, winnerTeam)
      bracketRounds.value = JSON.parse(JSON.stringify(bracketRounds.value))
    } catch (e: any) {
      throw e
    }
  }

  return {
    bracketRounds,
    initRoundsFromTournament,
    generateBracket,
    applyDotaResultToMatch
  }
}
