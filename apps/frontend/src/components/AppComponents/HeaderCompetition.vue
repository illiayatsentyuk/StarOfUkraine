<script lang="ts" setup>
import {ref} from "vue"

const mode = ref("Адмін")
const TournamentName = ref("")
const TournamentDescription = ref("")
const TournamentDate = ref("")
const TournamentDateRegistration = ref("")
const TournamentRounds = ref("")
const TournamentMaxTeams = ref("")
const TournamentDateRegistrationEnd = ref("")
const TournamentShowTeams = ref(false)
const isOpen = ref(false)
function foo(){
    localStorage.setItem("TournamentName", TournamentName.value)
    localStorage.setItem("TournamentDescription", TournamentDescription.value)
    localStorage.setItem("TournamentDate", TournamentDate.value)
    localStorage.setItem("TournamentDateRegistration", TournamentDateRegistration.value)
    localStorage.setItem("TournamentRounds", TournamentRounds.value)
    localStorage.setItem("TournamentMaxTeams", TournamentMaxTeams.value)
    localStorage.setItem("TournamentDateRegistrationEnd", TournamentDateRegistrationEnd.value)
    // localStorage.setItem("TournamentShowTeams", TournamentShowTeams.value)
}
function openModal(){
    isOpen.value=true
}
function closeModal(){
    isOpen.value=false
    
}
</script>

<template lang="pug">
header.header-competition
    .header-competition__logo
        //- img(src="@/assets/logo.png" alt="logo")
    .header-competition__nav
        nav.navigation-header
            ul.navigation-header__list
                li.navigation-header__list-item
                    p.navigation-header__list-item-text Режим:
                        span.navigation-header__list-item-text-value {{ mode }}
                li.navigation-header__list-item
                    button.navigation-header__list-item-button(@click="openModal" type="button") + Створити турнір 
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
#isOpen{
    display: block;
}
#isClose{
    display: none;
}
</style>