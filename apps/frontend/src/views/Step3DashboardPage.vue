<script setup lang="ts">
type StatCard = {
  title: string
  value: string
  note: string
}

type RoverRow = {
  status: 'Available' | 'Reserved' | 'Maintenance'
  name: string
  battery: string
  rate: string
}

const navItems = [
  'Dashboard',
  'Fleet',
  'Rentals',
  'Maintenance',
  'Reports',
]

const statCards: StatCard[] = [
  { title: 'Total Rovers', value: '27', note: '+2 added this week' },
  { title: 'Available Now', value: '14', note: '52% utilization' },
  { title: 'Needs Maintenance', value: '5', note: '2 due in next 24h' },
]

const roverRows: RoverRow[] = [
  { status: 'Available', name: 'Aurora Scout', battery: '92%', rate: '$145/day' },
  { status: 'Reserved', name: 'Curiosity-X', battery: '84%', rate: '$168/day' },
  { status: 'Maintenance', name: 'Spirit-9', battery: '41%', rate: '$120/day' },
  { status: 'Available', name: 'Pathfinder Neo', battery: '77%', rate: '$152/day' },
  { status: 'Available', name: 'Dusty McWheelface', battery: '88%', rate: '$171/day' },
]
</script>

<template lang="pug">
.dashboard
  aside.sidebar
    .sidebar__logo
      .sidebar__logo-mark
      span LUNARIS

    nav.sidebar__nav
      button.sidebar__item(
        v-for="item in navItems"
        :key="item"
        :class="{ 'sidebar__item--active': item === 'Dashboard' }"
        type="button"
      ) {{ item }}

    .sidebar__footer
      p.sidebar__user Joe Doe
      p.sidebar__email joe@acmecorp.com

  main.content
    header.content__header
      h1 Rover Management Dashboard
      p Track fleet status and available rovers for rental.

    section.stats
      article.stat-card(v-for="card in statCards" :key="card.title")
        p.stat-card__title {{ card.title }}
        p.stat-card__value {{ card.value }}
        p.stat-card__note {{ card.note }}

    section.rovers
      .rovers__head
        h2 Available Rovers for Rent
        p Live inventory with status, battery health, and pricing.

      .table-wrap
        table.rovers-table
          thead
            tr
              th Status
              th Name
              th Battery
              th Rate
          tbody
            tr(v-for="rover in roverRows" :key="rover.name")
              td
                span.status-badge(
                  :class="`status-badge--${rover.status.toLowerCase()}`"
                ) {{ rover.status }}
              td {{ rover.name }}
              td {{ rover.battery }}
              td {{ rover.rate }}
</template>

<style lang="scss" scoped>
.dashboard {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 17.5rem 1fr;
  background: #090b10;
  color: #f3f4f6;
}

.sidebar {
  border-right: 1px solid #1f2430;
  background: #0f1219;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.08em;
  color: #f59e0b;
  margin-bottom: var(--space-6);
}

.sidebar__logo-mark {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: linear-gradient(140deg, #fbbf24, #f97316);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.sidebar__item {
  width: 100%;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: #cbd5e1;
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.sidebar__item:hover {
  background: #161b25;
  color: #f8fafc;
}

.sidebar__item--active {
  background: #1c2431;
  border-color: #2b364a;
  color: #ffffff;
}

.sidebar__footer {
  border-top: 1px solid #1f2430;
  padding-top: var(--space-4);
}

.sidebar__user {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

.sidebar__email {
  margin: var(--space-1) 0 0;
  color: #94a3b8;
  font-size: var(--font-size-sm);
}

.content {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.content__header h1 {
  margin: 0;
  font-size: 1.75rem;
}

.content__header p {
  margin: var(--space-2) 0 0;
  color: #94a3b8;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

.stat-card {
  border: 1px solid #232a37;
  border-radius: var(--radius-lg);
  background: #10151f;
  padding: var(--space-5);
}

.stat-card__title {
  margin: 0;
  color: #94a3b8;
  font-size: var(--font-size-sm);
}

.stat-card__value {
  margin: var(--space-2) 0;
  font-size: 2rem;
  font-weight: 700;
}

.stat-card__note {
  margin: 0;
  color: #94a3b8;
  font-size: var(--font-size-sm);
}

.rovers {
  border: 1px solid #232a37;
  border-radius: var(--radius-lg);
  background: #10151f;
}

.rovers__head {
  padding: var(--space-5);
  border-bottom: 1px solid #232a37;
}

.rovers__head h2 {
  margin: 0;
  font-size: var(--font-size-xl);
}

.rovers__head p {
  margin: var(--space-2) 0 0;
  color: #94a3b8;
  font-size: var(--font-size-sm);
}

.table-wrap {
  overflow-x: auto;
}

.rovers-table {
  width: 100%;
  border-collapse: collapse;
}

.rovers-table th,
.rovers-table td {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid #232a37;
  font-size: var(--font-size-sm);
}

.rovers-table th {
  color: #94a3b8;
  font-weight: var(--font-weight-medium);
}

.status-badge {
  display: inline-flex;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  border: 1px solid transparent;
}

.status-badge--available {
  background: #052e22;
  color: #34d399;
  border-color: #115e46;
}

.status-badge--reserved {
  background: #3a2500;
  color: #fbbf24;
  border-color: #78350f;
}

.status-badge--maintenance {
  background: #2c1a1a;
  color: #fda4af;
  border-color: #7f1d1d;
}

@include media($md) {
  .content {
    padding: var(--space-8);
  }
}

@media (max-width: 980px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: 0;
    border-bottom: 1px solid #1f2430;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
