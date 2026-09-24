# Vue 3 Tournament

Tournament brackets generator using Vue 3.

base on [vue-tournament-bracket](https://github.com/RuiChen0101/vue-tournament)

![example](./image/example.png)

## Installation and component usage

Install component via:

```bash
npm install vue3-tournament
```

Example:

```html
<template>
  <TournamentBracket
    :rounds="rounds"
    @onMatchClick="onMatchClick"
    @onParticipantClick="onParticipantClick"
  >
    <!--
    <template #match.title="{ match }">
      <div class="title">
        <span>{{ match?.title }}</span>
      </div>
    </template>
    <template #team="{ team, match }">
      <span class="name">{{ team.name }}</span>
      <span class="score" v-if="team.score != undefined && team.score >= 0">{{ team.score }}</span>
    </template>
    <template #team.name="{ team, match }">
      <span class="name">{{ team.name }}</span>
    </template>
    <template #team.score="{ team, match }">
      <span class="score" v-if="team.score != undefined && team.score >= 0">{{ team.score }}</span>
    </template>
    <template #feedIn="{ team, match }">
      <span class="name">{{ team.name }}</span>
    </template>
    -->
  </TournamentBracket>
</template>

<script lang="ts">
import { TournamentBracket } from "vue3-tournament"
// import type IRound from "vue3-tournament/interface/IRound"
import type IRound from "vue3-tournament/dist/interface/IRound"
import "vue3-tournament/style.css"

const onMatchClick = (matchId: string | number): void => {
  alert(`click: ${matchId}`)
}

const onParticipantClick = (participant: any, match: any): void => {
  console.log("participant", participant) // team or feedIn
  console.log("match", match)
}

const rounds = ref<IRound[]>([
  //Quarter
  {
    matchs: [
      {
        id: "match1",
        winner: "1",
        team1: { id: "1", name: "Competitor 1", score: 2 },
        team2: { id: "2", name: "Competitor 2", score: 1 },
      },
      {
        id: "match2",
        winner: "4",
        team1: { id: "3", name: "Competitor 3", score: 0 },
        team2: { id: "4", name: "Competitor 4", score: 2 },
      },
      {
        id: "match3",
        winner: "5",
        team1: { id: "5", name: "Competitor 5", score: 2 },
        team2: { id: "6", name: "Competitor 6", score: 1 },
      },
      {
        id: "match4",
        winner: "8",
        team1: { id: "7", name: "Competitor 7", score: 0 },
        team2: { id: "8", name: "Competitor 8", score: 2 },
      },
    ],
  },
  //Semi
  {
    matchs: [
      {
        id: "match5",
        winner: "4",
        team1: { id: "1", name: "Competitor 1", score: 1 },
        team2: { id: "4", name: "Competitor 4", score: 2 },
      },
      {
        id: "match6",
        winner: "8",
        team1: { id: "5", name: "Competitor 5", score: 1 },
        team2: { id: "8", name: "Competitor 8", score: 2 },
      },
    ],
  },
  //Final
  {
    matchs: [
      {
        id: "any_match_id",
        winner: "8",
        team1: { id: "4", name: "Competitor 4", score: 1 },
        team2: { id: "8", name: "Competitor 8", score: 3 },
      },
    ],
  },
])
</script>
```

### FeedIn

You can use feed-in to display seeded round

![example](./image/feedin_example.png)

``` json
[
  {
    "matchs": [
      {
        "id": "match1",
        "winner": "1",
        "team1": {
          "id": "1",
          "name": "Competitor 1",
          "score": 2
        },
        "team2": {
          "id": "2",
          "name": "Competitor 2",
          "score": 1
        }
      },
      {
        "id": "match2",
        "feedIn": {
          "id": "3",
          "name": "Competitor 3"
        }
      }
    ]
  },
  {
    "matchs": [
      {
        "id": "match3",
        "winner": "3",
        "team1": {
          "id": "1",
          "name": "Competitor 1",
          "score": 1
        },
        "team2": {
          "id": "3",
          "name": "Competitor 3",
          "score": 2
        }
      },
      {
        "id": "match4",
        "feedIn": {
          "id": "4",
          "name": "Competitor 4"
        }
      }
    ]
  },
  {
    "matchs": [
      {
        "id": "any_match_id",
        "winner": "4",
        "team1": {
          "id": "3",
          "name": "Competitor 3",
          "score": 1
        },
        "team2": {
          "id": "4",
          "name": "Competitor 4",
          "score": 3
        }
      }
    ]
  }
]
```
