<script lang="ts" setup>
import {ref} from "vue"

const mode = ref("Адмін")
const TournamentName = ref("")
const isOpen = ref(false)
function foo(){
    
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
        img(src="@/assets/logo.png" alt="logo")
    .header-competition__nav
        nav.navigation-header
            ul.navigation-header__list
                li.navigation-header__list-item
                    p.navigation-header__list-item-text Режим:
                        span.navigation-header__list-item-text-value {{ mode }}
                li.navigation-header__list-item
                    button.navigation-header__list-item-button(@click="foo" type="button") + Створити турнір 
.create-tournament-modal(v-bind:id="isOpen")
    .create-tournament-modal__header
        h2.create-tournament-modal__header-title Створити турнір
        button.create-tournament-modal__header-close-button(@click="closeModal" type="button") 
    form.create-create-tournament-modal__form
        .create-create-tournament-modal
            h2.
        //- h1.create-tournament-modal__form-title Назва турніру
        //- input.create-tournament-modal__form-input(type="text" v-model="TournamentName" placeholder="Введіть назву турніру")
        //- h1.create-tournament-modal__form-title Дата проведення
        //- input.create-tournament-modal__form-input(type="date" placeholder="Введіть дату проведення")
        //- h1.create-tournament-modal__form-title Місце проведення
        //- input.create-tournament-modal__form-input(type="text" placeholder="Введіть місце проведення")
        //- h1.create-tournament-modal__form-title Кількість учасників
        //- input.create-tournament-modal__form-input(type="number" placeholder="Введіть кількість учасників")
        //- h1.create-tournament-modal__form-title Призовий фонд
        //- input.create-tournament-modal__form-input(type="number" placeholder="Введіть призовий фонд")
        //- button.create-tournament-modal__form-button(type="submit") Створити турнір
</template>

<style lang="scss" scoped>

</style>