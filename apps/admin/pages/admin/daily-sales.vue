<template>
  <div class="daily-sales-page">
    <DailySalesPanel />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })
</script>

<style scoped>
.daily-sales-page {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}
</style>
