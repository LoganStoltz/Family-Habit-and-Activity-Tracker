<template>
  <div class="dashboard-card" :style="cardVars">
    <div class="card-header">
      <div class="card-avatar">
        <span>{{ habit.name?.charAt(0) || 'H' }}</span>
      </div>
      <div class="card-title-block">
        <div class="card-title-row">
          <span class="card-title">{{ habit.name }}</span>
          <span v-if="(habit?.category || 'generic') !== 'generic'" class="chip" :style="{ color: palette.accent }">
            {{ habit.category }}
          </span>
        </div>
        <div class="card-meta">
          <span class="pill" :style="{ color: palette.accent, backgroundColor: palette.tint }">{{ logs.length }} logged</span>
          <span class="pill muted">ID #{{ habit.id }}</span>
        </div>
      </div>
    </div>

    <div class="card-progress">
      <div class="progress-label">Activity</div>
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

const palette = computed(() => {
  const options = [
    { accent: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)', tint: 'rgba(37, 99, 235, 0.12)' },
    { accent: '#16a34a', gradient: 'linear-gradient(135deg, #16a34a, #34d399)', tint: 'rgba(22, 163, 74, 0.12)' },
    { accent: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #fdba74)', tint: 'rgba(249, 115, 22, 0.14)' },
    { accent: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)', tint: 'rgba(124, 58, 237, 0.12)' },
    { accent: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9, #22d3ee)', tint: 'rgba(14, 165, 233, 0.12)' },
  ];
  const idx = (props.habit?.id ?? 0) % options.length;
  return options[idx];
});

const localProgressStyle = computed(() => {
  const percent = props.logs?.length > 0 ? 100 : 0;
  return {
    width: `${percent}%`,
    background: palette.value.gradient,
  };
});

const localActionBtnStyle = computed(() => ({
  background: palette.value.gradient,
  color: '#fff',
  fontWeight: 700,
}));

const cardVars = computed(() => ({
  '--accent': palette.value.accent,
  '--tint': palette.value.tint,
  '--gradient': palette.value.gradient,
}));

function onLog() { emit('log-habit', props.habit); }
function onEdit() { emit('edit-habit', props.habit); }
function onDelete() { emit('delete-habit', props.habit); }
</script>

<style scoped>
.dashboard-card {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 18px 18px 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.dashboard-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--tint);
  border-radius: 12px;
  padding: 12px 12px 10px;
  margin: -6px -6px 12px;
}

.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 1.05rem;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.18);
  background: var(--gradient);
}

.card-title-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.card-title {
  font-size: 1.12rem;
  font-weight: 800;
  color: #0f172a;
}

.chip {
  padding: 5px 10px;
  border-radius: 10px;
  background: #f8fafc;
  font-weight: 700;
  font-size: 0.88rem;
  border: 1px solid #e2e8f0;
  color: var(--accent);
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: var(--accent);
}

.pill.muted {
  color: #475569;
  background: #f8fafc;
}

.card-progress {
  margin-top: 14px;
  padding: 12px 12px 10px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.progress-label {
  font-size: 0.94rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.25s ease;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
}

.card-action-row {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.card-action-btn {
  border: 1px solid #d9e2ec;
  border-radius: 12px;
  padding: 0.78rem 1.15rem;
  cursor: pointer;
  font-size: 0.98rem;
  font-weight: 800;
  color: #0f172a;
  background: #ffffff;
  transition: transform 0.14s ease, box-shadow 0.14s ease, filter 0.14s ease;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.10);
}

.card-action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.02);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.card-action-btn:disabled,
.delete-habit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.edit-habit-btn {
  background: #0f172a;
  color: #f8fafc;
  border-color: #0f172a;
}

.delete-habit-btn {
  border: none;
  border-radius: 12px;
  padding: 0.78rem 1.15rem;
  cursor: pointer;
  font-size: 0.98rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f43f5e, #e11d48);
  color: #fff;
  box-shadow: 0 12px 24px rgba(244, 63, 94, 0.24);
  transition: transform 0.14s ease, box-shadow 0.14s ease, filter 0.14s ease;
}

.delete-habit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(244, 63, 94, 0.3);
}

.card-error {
  color: #b91c1c;
  font-size: 0.94rem;
  margin-top: 10px;
}

@media (max-width: 520px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-action-row {
    flex-direction: column;
  }
}
</style>