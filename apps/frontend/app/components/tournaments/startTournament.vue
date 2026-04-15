<template lang="pug">

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTournamentsStore } from '../../stores/tournaments.store'

const store = useTournamentsStore()
const props = defineProps({
    isOpen: Boolean,
    tournament: Object
})
const emit = defineEmits(['close', 'delete'])

const inputText = ref('')
const isStarting = ref(false)

const isConfirmed = computed(() => {
    if (!props.tournament || !props.tournament.name) return false
    return inputText.value === props.tournament.name.toUpperCase()
})

</script>

<style lang="scss" scoped>

</style>