/** Shared mock payloads for tournament E2E tests */

export const mockTournamentListItem = {
  id: 't-1',
  name: 'Cup 2026',
  description: 'Demo tournament',
  startDate: '2026-05-01T00:00:00.000Z',
  maxTeams: 16,
  status: 'DRAFT',
} as const

export const mockTournamentListResponse = {
  data: [mockTournamentListItem],
  totalPages: 1,
} as const

export const mockTournamentDetail = {
  id: 't-1',
  name: 'Cup 2026',
  description: 'About Cup 2026',
  rounds: 3,
  teamSizeMin: 1,
  teamSizeMax: 5,
  maxTeams: 16,
  status: 'DRAFT',
  hideTeamsUntilRegistrationEnds: false,
  registrationEnd: '2020-01-01T00:00:00.000Z',
} as const

export const mockEmptyTeamsList = {
  data: [],
  totalPages: 0,
} as const

/** Full enough for edit form initial values (dates + team sizes). */
export const mockTournamentDetailForEdit = {
  id: 't-1',
  name: 'Cup 2026',
  description: 'About Cup 2026',
  startDate: '2026-06-15T00:00:00.000Z',
  registrationStart: '2026-04-01T00:00:00.000Z',
  registrationEnd: '2026-05-10T00:00:00.000Z',
  rounds: 3,
  teamSizeMin: 2,
  teamSizeMax: 5,
  maxTeams: 16,
  status: 'DRAFT',
  hideTeamsUntilRegistrationEnds: false,
} as const
