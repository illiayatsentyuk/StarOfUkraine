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
} as const;
