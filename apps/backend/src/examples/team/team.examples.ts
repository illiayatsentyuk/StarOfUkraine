import { Role } from '../../enum';

const memberUserExample = {
  id: 'clx_user_1',
  email: 'olena@example.com',
  name: 'Olena Kovalenko',
  nameId: 'olena-kovalenko-123',
  image: null as string | null,
  role: Role.USER,
  createdAt: '2026-03-12T10:00:00.000Z',
  updatedAt: '2026-03-12T10:00:00.000Z',
};

const memberUserExample2 = {
  id: 'clx_user_2',
  email: 'taras@example.com',
  name: 'Taras Shevchenko',
  nameId: 'taras-shevchenko-456',
  image: null as string | null,
  role: Role.USER,
  createdAt: '2026-03-12T10:00:00.000Z',
  updatedAt: '2026-03-12T10:00:00.000Z',
};

export const teamExamples = {
  createRequest: {
    name: 'Star of Ukraine',
    captainName: 'Olena Kovalenko',
    city: 'Kyiv',
    organization: 'UA Esports',
    telegram: '@starofukraine',
    discord: 'starofukraine#1234',
  },
  response: {
    id: 'clx_team_123',
    name: 'Star of Ukraine',
    captainName: 'Olena Kovalenko',
    captainEmail: 'olena@example.com',
    members: [memberUserExample, memberUserExample2],
    captain: memberUserExample,
    city: 'Kyiv',
    organization: 'UA Esports',
    telegram: '@starofukraine',
    discord: 'starofukraine#1234',
    createdAt: '2026-03-12T10:00:00.000Z',
    updatedAt: '2026-03-12T10:00:00.000Z',
  },
  paginatedResponse: {
    data: [
      {
        id: 'clx_team_123',
        name: 'Star of Ukraine',
        captainName: 'Olena Kovalenko',
        captainEmail: 'olena@example.com',
        members: [memberUserExample, memberUserExample2],
        captain: memberUserExample,
        city: 'Kyiv',
        organization: 'UA Esports',
        telegram: '@starofukraine',
        discord: 'starofukraine#1234',
        createdAt: '2026-03-12T10:00:00.000Z',
        updatedAt: '2026-03-12T10:00:00.000Z',
      },
    ],
    currentPage: 1,
    nextPage: 2,
    previousPage: null,
    totalPages: 3,
    itemsPerPage: 10,
  },
} as const;
