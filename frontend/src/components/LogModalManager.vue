<template>
  <div>
    <ExerciseLogs
      v-if="habit.category === 'exercise'"
      :habit="habit"
      @close="$emit('close')"
      @submit-log="$emit('submit-log', $event)"
    />
    <DiaperChangeLog
      v-else-if="habit.category === 'diaper'"
      :habit="habit"
      @close="$emit('close')"
      @submit-log="$emit('submit-log', $event)"
    />
    <CleaningLogs
      v-else-if="habit.category === 'cleaning'"
      :habit="habit"
      @close="$emit('close')"
      @submit-log="$emit('submit-log', $event)"
    />
    <BabyBathLogs
      v-else-if="habit.category === 'babyBath'"
      :habit="habit"
      @close="$emit('close')"
      @submit-log="$emit('submit-log', $event)"
    />
    <AdultBathLogs
      v-else-if="habit.category === 'adultBath'"
      :habit="habit"
      @close="$emit('close')"
      @submit-log="$emit('submit-log', $event)"
    />
  </div>
</template>

<script setup>
import ExerciseLogs from './Logs/ExerciseLogs.vue'
import DiaperChangeLog from './Logs/DiaperChangeLog.vue'
import CleaningLogs from './Logs/CleaningLogs.vue'
import BabyBathLogs from './Logs/BabyBathLogs.vue'
import AdultBathLogs from './Logs/AdultBathLogs.vue'

defineProps({ habit: Object })
defineEmits(['close', 'submit-log'])
</script>
