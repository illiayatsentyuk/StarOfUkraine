<script lang="ts" setup>
import {ref} from "vue"
import CreateTournamentModal from "../CreateTournament/CreateTournamentModal.vue"

const mode = ref("Адмін")
const isOpen = ref(false)

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
CreateTournamentModal(:isOpen="isOpen" @close="closeModal")
</template>

<style lang="scss" scoped>
</style>