<script lang="ts" setup>
import { ref } from "vue"

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const TournamentName = ref("")
const TournamentDescription = ref("")
const TournamentDate = ref("")
const TournamentDateRegistration = ref("")
const TournamentRounds = ref("")
const TournamentMaxTeams = ref("")
const TournamentDateRegistrationEnd = ref("")
const TournamentShowTeams = ref(false)

function foo() {
    const tournament = {
        name: TournamentName.value,
        description: TournamentDescription.value,
        date: TournamentDate.value,
        registrationDate: TournamentDateRegistration.value,
        rounds: TournamentRounds.value,
        maxTeams: TournamentMaxTeams.value,
        registrationEnd: TournamentDateRegistrationEnd.value,
        showTeam:TournamentShowTeams.value
    }
    const tournaments = JSON.parse(localStorage.getItem("tournaments")) || [];
    tournaments.push(tournament)
    localStorage.setItem("tournaments", JSON.stringify(tournaments));

    TournamentName.value = ""
    TournamentDescription.value = ""
    TournamentDate.value = ""
    TournamentDateRegistration.value = ""
    TournamentRounds.value = ""
    TournamentMaxTeams.value = ""
    TournamentDateRegistrationEnd.value = ""
    TournamentShowTeams.value = false
    emit("close")
}


function closeModal() {
  emit("close")
}
</script>

<template lang="pug">
.create-tournament-modal(v-show="isOpen")
    .create-tournament-modal__header
        h2.create-tournament-modal__header-title Створити турнір
        button.create-tournament-modal__header-close-button(@click="closeModal" type="button") 
    form.create-tournament-modal__form
        .create-tournament-modal__form-description
            h2.create-tournament-modal__form-description-title Назва турніру
            input.create-tournament-modal__form-description-input(type="text" v-model="TournamentName" placeholder="Введіть назву турніру")
        .create-tournament-modal__form-description
            h2.create-tournament-modal__form-description-title Опис та Правила
            input.create-tournament-modal__form-description-input(type="text" v-model="TournamentDescription" placeholder="Введіть опис та правила")
        .create-tournament-modal__form-description-dates
            .create-tournament-modal__form-description-dates-wr
                h2.create-tournament-modal__form-description-title Дата старту турніру
                input.create-tournament-modal__form-description-input(type="date" v-model="TournamentDate" placeholder="Дата старту турніру")
            .create-tournament-modal__form-description-dates-wr
                h2.create-tournament-modal__form-description-title Початок реєстрації
                input.create-tournament-modal__form-description-input(type="date" v-model="TournamentDateRegistration" placeholder="Дата початок реєстрації")
            .create-tournament-modal__form-description-dates-wr
                h2.create-tournament-modal__form-description-title Кількість раундів
                input.create-tournament-modal__form-description-input(type="number" v-model="TournamentRounds" placeholder="Кількість раундів")
            .create-tournament-modal__form-description-dates-wr
                h2.create-tournament-modal__form-description-title Макс.команд (опційно)
                input.create-tournament-modal__form-description-input(type="number" v-model="TournamentMaxTeams" placeholder="Макс.команд")
            .create-tournament-modal__form-description-dates-wr
                h2.create-tournament-modal__form-description-title Кінець реєстрації
                input.create-tournament-modal__form-description-input(type="date" v-model="TournamentDateRegistrationEnd" placeholder="Дата кінець реєстрації")
            .create-tournament-modal__form-description-dates-wr
                input.create-tournament-modal__form-description-input(type="checkbox" v-model="TournamentShowTeams" placeholder="Дата кінець турніру")
                p.create-tournament-modal__form-description-input-text Показати команди    
            button.create-tournament-modal__form__button(type="submit" @click="foo") Створити турнір
</template>

<style lang="scss" scoped>
// Note: Styles were mostly in HeaderCompetition.vue or global. 
// If they were in HeaderCompetition.vue, they should be moved here.
// The original file had very few styles for the modal itself in the scoped section.
</style>
