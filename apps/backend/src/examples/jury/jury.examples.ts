export const juryExamples = {
  addToJuryRequest: {
    tournamentId: 'tournament-1',
    userId: 'user-1',
  },
  juryResponse: {
    id: 'jury-1',
    userId: 'user-1',
    tournaments: [
      {
        id: 'tournament-1',
        name: 'Star of Ukraine Cup 2026',
      },
    ],
  },
  removeResponse: {
    message: 'Jury removed successfully',
  },
} as const;

