<template>
  <footer class="appFooter">
    Made by Logan Stoltz, {{ currentYear }} | {{ todayLabel }}
  </footer>
</template>

<script setup>
const now = new Date();
const currentYear = now.getFullYear();
const todayLabel = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
}).format(now);
</script>

<style scoped>
.appFooter {
  margin-top: 1.5rem;
  padding: 1rem 1.25rem;
  text-align: center;
  color: var(--text-primary);
  border-top: 1px solid rgba(143, 182, 224, 0.28);
  background: rgba(16, 37, 58, 0.72);
  backdrop-filter: blur(6px);
  box-shadow: 0 -6px 18px rgba(5, 12, 26, 0.28);
  letter-spacing: 0.2px;
  font-size: 0.9rem;
}
</style>
