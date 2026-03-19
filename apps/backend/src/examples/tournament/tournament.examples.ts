import { TournamentStatus } from '../../../generated/prisma';

export const tournamentExamples = {
  createRequest: {
    name: 'Star of Ukraine Cup 2026',
    description: 'Open tournament for teams across Ukraine.',
    startDate: '2026-04-01T12:00:00.000Z',
    registrationStart: '2026-03-20T00:00:00.000Z',
    registrationEnd: '2026-03-30T23:59:59.000Z',
    maxTeams: 64,
    rounds: 6,
    teamSizeMin: 5,
    teamSizeMax: 7,
    status: TournamentStatus.DRAFT,
    hideTeamsUntilRegistrationEnds: true,
  },
  response: {
    id: 'clx_tournament_123',
    name: 'Star of Ukraine Cup 2026',
    description: 'Open tournament for teams across Ukraine.',
    startDate: '2026-04-01T12:00:00.000Z',
    registrationStart: '2026-03-20T00:00:00.000Z',
    registrationEnd: '2026-03-30T23:59:59.000Z',
    maxTeams: 64,
    rounds: 6,
    teamSizeMin: 5,
    teamSizeMax: 7,
    status: TournamentStatus.DRAFT,
    hideTeamsUntilRegistrationEnds: true,
    createdAt: '2026-03-12T10:00:00.000Z',
  },
} as const;
