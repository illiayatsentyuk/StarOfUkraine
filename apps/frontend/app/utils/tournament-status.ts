import type { Tournament } from '~/types'

export type TournamentStatusCode = 'planned' | 'registration' | 'waiting' | 'active' | 'finished'

export interface TournamentStatusInfo {
    code: TournamentStatusCode
    label: string
    color: string
}

export function calculateTournamentStatus(tournament: Tournament, bracketRounds?: any[]): TournamentStatusInfo {
    const now = new Date()
    const regStart = new Date(tournament.registrationStart)
    const regEnd = new Date(tournament.registrationEnd)
    const startDate = new Date(tournament.startDate)

    // 1. ПЛАНУЄТЬСЯ (Registration hasn't started)
    if (now < regStart) {
        return { code: 'planned', label: 'ПЛАНУЄТЬСЯ', color: '#666666' }
    }

    // 2. РЕЄСТРАЦІЯ (During registration)
    if (now >= regStart && now <= regEnd) {
        return { code: 'registration', label: 'РЕЄСТРАЦІЯ', color: 'var(--color-primary)' }
    }

    // 3. ОЧІКУВАННЯ (Registration ended, waiting for start)
    if (now > regEnd && now < startDate) {
        return { code: 'waiting', label: 'ОЧІКУВАННЯ', color: '#000000' }
    }

    // 4. ЗАВЕРШЕНО (Finished)
    // Перевірка по фінальному матчу в сітці
    if (bracketRounds && bracketRounds.length > 0) {
        const lastRound = bracketRounds[bracketRounds.length - 1]
        if (lastRound.matchs && lastRound.matchs.length === 1) {
            if (lastRound.matchs[0].winner) {
                return { code: 'finished', label: 'ЗАВЕРШЕНО', color: '#00cc00' }
            }
        }
    }
    
    // Хевристика: якщо минуло більше 2 днів від старту і немає даних про сітку
    const twoDaysAfterStart = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000)
    if (now > twoDaysAfterStart) {
         return { code: 'finished', label: 'ЗАВЕРШЕНО', color: '#00cc00' }
    }

    // 5. ТРИВАЄ (Started)
    if (now >= startDate) {
        return { code: 'active', label: 'ТРИВАЄ', color: '#ff8800' }
    }

    // Fallback
    return { code: 'waiting', label: 'ОЧІКУВАННЯ', color: '#000000' }
}
