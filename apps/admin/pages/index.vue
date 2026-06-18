<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
// Redirect to POS terminal by default (cashiers land here first)
navigateTo('/pos')
</script>
<template><div /></template>
