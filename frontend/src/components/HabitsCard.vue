<template>
  <div class="dashboard-card">
    <div class="card-header">
      <span class="card-title">{{ habit.name }}</span>
      <div v-if="(habit?.category || 'generic') !== 'generic'" class="card-category">
        ({{ habit.category || 'No category provided.' }})
      </div>
    </div>

    <div class="card-progress">
      <div class="progress-label">
        {{ logs.length }} logged
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="localProgressStyle"></div>
      </div>
    </div>

    <div class="card-action-row">
      <button
        class="card-action-btn"
        :style="localActionBtnStyle"
        @click="onLog"
        :disabled="Boolean(incrementing[habit.id])"
      >
        <span v-if="incrementing[habit.id]">Logging...</span>
        <span v-else>Log {{ habit.name }}</span>
      </button>

      <button 
        class="edit-habit-btn card-action-btn" 
        @click="onEdit"
        :disabled="Boolean(isEditing[habit.id])"
      >
        {{ isEditing[habit.id] ? 'Editing...' : 'Edit Habit' }}
      </button>

      <button
        class="delete-habit-btn"
        @click="onDelete"
        :disabled="Boolean(isDeleting[habit.id])"
      >
        {{ isDeleting[habit.id] ? 'Deleting...' : 'Delete Habit' }}
      </button>
    </div>

    <div v-if="incrementError[habit.id]" class="card-error">{{ incrementError[habit.id] }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  habit: { type: Object, required: true },
  logs: { type: Array, default: () => [] },
  incrementing: { type: Object, default: () => ({}) },
  incrementError: { type: Object, default: () => ({}) },
  isDeleting: { type: Object, default: () => ({}) },
  isEditing: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['log-habit', 'edit-habit', 'delete-habit']);

const localProgressStyle = computed(() => {
  const percent = props.logs?.length > 0 ? 100 : 0;
  return `width: ${percent}%; background: #4f9dff; height: 8px; border-radius: 8px;`;
});

const localActionBtnStyle = computed(() => {
  const colors = ['#4f9dff', '#74ebd5', '#a78bfa', '#ffd166', '#ff8fa3'];
  const idx = (props.habit?.id ?? 0) % colors.length;
  return `background: ${colors[idx]}; color: #fff; font-weight: 600; border-radius: 8px; padding: 0.7rem 1.2rem; font-size: 1rem; box-shadow: 0 2px 8px rgba(79,157,255,0.10);`;
});

function onLog() { emit('log-habit', props.habit); }
function onEdit() { emit('edit-habit', props.habit); }
function onDelete() { emit('delete-habit', props.habit); }
</script>

<style scoped>
</style>