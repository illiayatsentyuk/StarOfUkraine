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
} as const;
