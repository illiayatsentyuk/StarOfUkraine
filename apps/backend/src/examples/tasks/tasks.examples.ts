export const tasksExamples = {
  createTasksRequest: {
    tasks: [
      {
        name: 'Раунд 1 — Відбірковий',
        description: '## Завдання\n\nОпис у Markdown.',
        order: 1,
        criteria: {
          rubric: [
            { id: 'functionality', label: 'Функціональність', maxPoints: 40 },
            { id: 'code', label: 'Якість коду', maxPoints: 30 },
          ],
        },
      },
    ],
  },
  taskResponse: {
    id: 'clx_task_123',
    tournamentId: 'clx_tournament_123',
    name: 'Раунд 1 — Відбірковий',
    description: '## Завдання\n\n',
    order: 1,
    criteria: { rubric: [] },
  },
  taskActiveResponse: {
    id: 'clx_task_123',
    tournamentId: 'clx_tournament_123',
    name: 'Раунд 1 — Відбірковий',
    description: '## Завдання\n\n',
    order: 1,
    status: 'ACTIVE',
    criteria: { rubric: [] },
    startsAt: '2026-04-15T10:00:00.000Z',
  },
  taskSubmissionClosedResponse: {
    id: 'clx_task_123',
    tournamentId: 'clx_tournament_123',
    name: 'Раунд 1 — Відбірковий',
    description: '## Завдання\n\n',
    order: 1,
    status: 'SUBMISSION_CLOSED',
    criteria: { rubric: [] },
  },
  tasksListResponse: [
    {
      id: 'clx_task_123',
      tournamentId: 'clx_tournament_123',
      name: 'Раунд 1 — Відбірковий',
      description: '## Завдання\n\n',
      order: 1,
      criteria: { rubric: [] },
    },
    {
      id: 'clx_task_124',
      tournamentId: 'clx_tournament_123',
      name: 'Раунд 2 — Фінал',
      description: '## Фінал\n\n',
      order: 2,
      criteria: { rubric: [] },
    },
  ],
  updateTaskRequest: {
    name: 'Раунд 1 — Оновлена назва',
    criteria: {
      rubric: [{ id: 'code', label: 'Якість коду', maxPoints: 15 }],
    },
  },
  submitTaskRequest: {
    teamId: 'clx_team_abc',
    githubUrl: 'https://github.com/org/project',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    liveUrl: 'https://my-app.vercel.app',
    summary:
      'Реалізовано REST API на NestJS з PostgreSQL. Для запуску: npm start',
  },
  submissionResponse: {
    id: 'clx_submission_123',
    taskId: 'clx_task_123',
    teamId: 'clx_team_abc',
    githubUrl: 'https://github.com/org/project',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'PENDING',
  },
  submissionsListResponse: [
    {
      id: 'clx_submission_123',
      taskId: 'clx_task_123',
      teamId: 'clx_team_abc',
      githubUrl: 'https://github.com/org/project',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'PENDING',
      team: {
        id: 'clx_team_abc',
        name: 'Team Alpha',
        captainName: 'Olena Kovalenko',
        captainEmail: 'olena@example.com',
        city: 'Kyiv',
        organization: 'UA Esports',
      },
    },
  ],
  evaluateSubmissionRequest: {
    scores: [
      { id: 'functionality', points: 35 },
      { id: 'code', points: 25 },
    ],
    comment: 'Сильна реалізація. Рекомендую додати тести та обробку помилок.',
  },
  evaluationResponse: {
    id: 'clx_eval_123',
    submissionId: 'clx_submission_123',
    juryId: 'clx_jury_123',
    scores: {
      rubric: [
        { id: 'functionality', points: 35 },
        { id: 'code', points: 25 },
      ],
    },
    totalScore: 60,
    comment: 'Сильна реалізація. Рекомендую додати тести та обробку помилок.',
  },
} as const;
