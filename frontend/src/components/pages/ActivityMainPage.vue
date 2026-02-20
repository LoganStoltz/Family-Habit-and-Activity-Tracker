<template>
  <div class="activityMainPage">
    <div class="activityContent">
      <!-- Activity Log Component Sections -->
      <section class="activitySection">
        <ActivityLogSections ref="activityLogSectionsRef"/>
      </section>

      <!-- Habits Page Component Section -->
      <section class="activitySection">
        <HabitsPage ref="habitsPageRef" />
      </section>
    </div>
  </div>
    
</template>

<script setup>
import ActivityLogSections from '../pages/ActivityLogSections.vue'
import HabitsPage from '../pages/HabitsPage.vue'
</script>


<style scoped>
.activityMainPage {
  max-width: 1600px;
  margin: 20px auto;
  box-sizing: border-box;
}
</style>