import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TaskStatus, TournamentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const HASH = (pw: string) => bcrypt.hash(pw, 10);

async function main() {
  console.log('🌱 Starting seed...');

  // ──────────────────────────────────────────────
  // Users
  // ──────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@seed.com' },
    update: {},
    create: {
      email: 'admin@seed.com',
      name: 'Адмін Сімоненко',
      nameId: 'admin-seed',
      hash: await HASH('Admin123!'),
      role: 'ADMIN',
    },
  });

  const juryUser = await prisma.user.upsert({
    where: { email: 'jury@seed.com' },
    update: {},
    create: {
      email: 'jury@seed.com',
      name: 'Журі Франко',
      nameId: 'jury-seed',
      hash: await HASH('Jury123!'),
      role: 'JURY',
    },
  });

  const teamUserDefs = [
    {
      email: 'captain1@seed.com',
      name: 'Олексій Шевченко',
      nameId: 'captain1-seed',
    },
    {
      email: 'captain2@seed.com',
      name: 'Марія Коваленко',
      nameId: 'captain2-seed',
    },
    {
      email: 'captain3@seed.com',
      name: 'Дмитро Бойко',
      nameId: 'captain3-seed',
    },
    {
      email: 'captain4@seed.com',
      name: 'Наталія Мороз',
      nameId: 'captain4-seed',
    },
    {
      email: 'captain5@seed.com',
      name: 'Андрій Поліщук',
      nameId: 'captain5-seed',
    },
    // team 6 — unevaluated, exists so jury can score it live via the UI
    {
      email: 'captain6@seed.com',
      name: 'Соломія Петренко',
      nameId: 'captain6-seed',
    },
  ];

  const captains = await Promise.all(
    teamUserDefs.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { ...u, hash: bcrypt.hashSync('User123!', 10), role: 'USER' },
      }),
    ),
  );

  console.log(`✅ Users created (admin, jury, ${captains.length} captains)`);

  // ──────────────────────────────────────────────
  // Jury profile
  // ──────────────────────────────────────────────
  const jury = await prisma.jury.upsert({
    where: { userId: juryUser.id },
    update: {},
    create: { userId: juryUser.id },
  });

  console.log('✅ Jury profile created');

  // ──────────────────────────────────────────────
  // Tournament
  // ──────────────────────────────────────────────
  const now = new Date();
  const tournament = await prisma.tournament.upsert({
    where: { id: 'seed-tournament-1' },
    update: { status: TournamentStatus.ONGOING },
    create: {
      id: 'seed-tournament-1',
      name: 'Зоря України — Відкритий Чемпіонат 2026',
      description:
        'Щорічний відкритий чемпіонат з програмування для студентів та молодих розробників. Команди змагаються у вирішенні реальних технічних задач.',
      startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      registrationStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      maxTeams: 32,
      rounds: 3,
      teamSizeMin: 2,
      teamSizeMax: 5,
      minJuryPerSubmission: 1,
      status: TournamentStatus.ONGOING,
      hideTeamsUntilRegistrationEnds: false,
      jurors: { connect: [{ id: jury.id }] },
    },
  });

  console.log(`✅ Tournament created: ${tournament.name}`);

  // ──────────────────────────────────────────────
  // Teams
  // ──────────────────────────────────────────────
  const teamDefs = [
    { suffix: '1', name: 'Кодові Яструби', captain: captains[0] },
    { suffix: '2', name: 'Залізні Вовки', captain: captains[1] },
    { suffix: '3', name: 'Цифрові Орли', captain: captains[2] },
    { suffix: '4', name: 'Сталеві Леви', captain: captains[3] },
    { suffix: '5', name: 'Вогняні Дракони', captain: captains[4] },
    // team 6 — submissions exist but NO evaluations → jury scores via UI to test live socket update
    { suffix: '6', name: 'Нові Кодери', captain: captains[5] },
  ];

  const teams = await Promise.all(
    teamDefs.map(({ suffix, name, captain }) =>
      prisma.team.upsert({
        where: { name },
        update: {},
        create: {
          name,
          captainName: captain.name ?? name,
          captain: { connect: { email: captain.email } },
          members: { connect: [{ email: captain.email }] },
          city: ['Київ', 'Харків', 'Львів', 'Одеса', 'Дніпро', 'Запоріжжя'][
            Number(suffix) - 1
          ],
          organization: `Університет ${suffix}`,
          tournaments: { connect: [{ id: tournament.id }] },
        },
      }),
    ),
  );

  console.log(`✅ ${teams.length} teams created and linked to tournament`);

  // ──────────────────────────────────────────────
  // Tasks
  // ──────────────────────────────────────────────
  const rubric = [
    { id: 'correctness', label: 'Правильність рішення', maxPoints: 40 },
    { id: 'performance', label: 'Продуктивність', maxPoints: 30 },
    { id: 'code_quality', label: 'Якість коду', maxPoints: 20 },
    { id: 'documentation', label: 'Документація', maxPoints: 10 },
  ];

  const taskDefs = [
    {
      id: 'seed-task-1',
      name: 'Алгоритмічний Штурм',
      description:
        'Реалізуйте ефективний алгоритм для задачі оптимізації маршруту. Ваше рішення повинно обробляти граф із 10 000 вузлів менш ніж за 200 мс. Завантажте вихідний код на GitHub та запишіть короткий відеоогляд.',
      order: 1,
    },
    {
      id: 'seed-task-2',
      name: 'Веб-Марафон',
      description:
        "Побудуйте міні-SaaS: сторінка реєстрації, авторизації та дашборд із live-оновленнями через WebSocket. Деплой обов'язковий. Оцінюється UX, безпека та якість коду.",
      order: 2,
    },
  ];

  const tasks = await Promise.all(
    taskDefs.map(({ id, name, description, order }) =>
      prisma.task.upsert({
        where: { id },
        update: { status: TaskStatus.SUBMISSION_CLOSED },
        create: {
          id,
          tournamentId: tournament.id,
          name,
          description,
          order,
          status: TaskStatus.SUBMISSION_CLOSED,
          criteria: { rubric },
        },
      }),
    ),
  );

  console.log(`✅ ${tasks.length} tasks created`);

  // ──────────────────────────────────────────────
  // Submissions
  // ──────────────────────────────────────────────
  const submissions: { id: string; teamIdx: number; taskIdx: number }[] = [];

  for (let ti = 0; ti < teams.length; ti++) {
    for (let tk = 0; tk < tasks.length; tk++) {
      const subId = `seed-sub-t${ti + 1}-task${tk + 1}`;
      await prisma.submission.upsert({
        where: {
          taskId_teamId: { taskId: tasks[tk].id, teamId: teams[ti].id },
        },
        update: {},
        create: {
          id: subId,
          taskId: tasks[tk].id,
          teamId: teams[ti].id,
          githubUrl: `https://github.com/seed-team-${ti + 1}/task-${tk + 1}`,
          videoUrl: `https://youtu.be/seed-demo-${ti + 1}-${tk + 1}`,
          liveUrl: `https://seed-team-${ti + 1}-task${tk + 1}.vercel.app`,
          summary: `Рішення команди "${teams[ti].name}" для завдання "${tasks[tk].name}". Використано TypeScript, Node.js та PostgreSQL.`,
        },
      });
      submissions.push({ id: subId, teamIdx: ti, taskIdx: tk });
    }
  }

  console.log(`✅ ${submissions.length} submissions created`);

  // ──────────────────────────────────────────────
  // Evaluations  (different scores → visible standings)
  // ──────────────────────────────────────────────
  // Points per team (sum across both tasks):
  //   Кодові Яструби  → 95 + 88 = 183
  //   Залізні Вовки   → 82 + 76 = 158
  //   Цифрові Орли    → 70 + 90 = 160
  //   Сталеві Леви    → 60 + 65 = 125
  //   Вогняні Дракони → 55 + 50 = 105
  //   Нові Кодери     → not evaluated (jury scores via UI)
  const scoreMatrix = [
    // [task1_total, task2_total]  index = teamIdx
    [95, 88],
    [82, 76],
    [70, 90],
    [60, 65],
    [55, 50],
  ];

  for (const sub of submissions) {
    if (sub.teamIdx === 5) continue; // Нові Кодери — left unevaluated for live UI testing

    const total = scoreMatrix[sub.teamIdx][sub.taskIdx];
    // Distribute total across rubric items (proportionally, integer)
    const rubricScores = [
      { id: 'correctness', points: Math.round(total * 0.42) },
      { id: 'performance', points: Math.round(total * 0.31) },
      { id: 'code_quality', points: Math.round(total * 0.21) },
      {
        id: 'documentation',
        points:
          total -
          Math.round(total * 0.42) -
          Math.round(total * 0.31) -
          Math.round(total * 0.21),
      },
    ];

    await prisma.evaluation.upsert({
      where: {
        submissionId_juryId: { submissionId: sub.id, juryId: jury.id },
      },
      update: {
        totalScore: total,
        scores: { rubric: rubricScores },
        comment: `Оцінено журі. Загальна оцінка: ${total}/100.`,
      },
      create: {
        submissionId: sub.id,
        juryId: jury.id,
        totalScore: total,
        scores: { rubric: rubricScores },
        comment: `Оцінено журі. Загальна оцінка: ${total}/100.`,
      },
    });

    // Mark submission as EVALUATED (minJury = 1)
    await prisma.submission.update({
      where: { id: sub.id },
      data: { status: 'EVALUATED' },
    });
  }

  console.log(
    '✅ Evaluations created for teams 1–5; team 6 left PENDING for live UI testing',
  );

  // ──────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────
  console.log('\n🏆 Seed complete! Test credentials:');
  console.log('  Admin  → admin@seed.com    / Admin123!');
  console.log('  Jury   → jury@seed.com     / Jury123!');
  console.log(
    '  User 6 → captain6@seed.com / User123!  ← captain of unevaluated "Нові Кодери"',
  );
  console.log(`\n  Tournament ID: ${tournament.id}`);
  console.log(`  Table page:     /tournaments/${tournament.id}/table`);
  console.log(
    `  Evaluate task1: /tournaments/${tournament.id}/tasks/seed-task-1/evaluate`,
  );
  console.log(
    `  Evaluate task2: /tournaments/${tournament.id}/tasks/seed-task-2/evaluate`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
