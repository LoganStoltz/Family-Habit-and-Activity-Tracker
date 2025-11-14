<template>
  <div class="modal-manager">
    <div v-if="currentModal === 'diaper'" class="modal-overlay">
      <DiaperChangeLog
        @log-submitted="payload => onSubmit(payload)"
        @close="() => closeModal('diaper')"
      />
    </div>

    <div v-if="currentModal === 'feeding'" class="modal-overlay">
      <FeedingLog
        @log-submitted="payload => onSubmit(payload)"
        @close="() => closeModal('feeding')"
      />
    </div>

    <div v-if="currentModal === 'drinkingWater'" class="modal-overlay">
      <DrinkingWaterLogs
        @log-submitted="payload => onSubmit(payload)"
        @close="() => closeModal('drinkingWater')"
      />
    </div>

    <div v-if="currentModal === 'exercise'" class="modal-overlay">
      <ExerciseLogs
        @log-submitted="payload => onSubmit(payload)"
        @close="() => closeModal('exercise')"
      />
    </div>

    <div v-if="currentModal === 'sleeping'" class="modal-overlay">
      <SleepingLog
        @log-submitted="payload => onSubmit(payload)"
        @close="() => closeModal('sleeping')"
      />
    </div>

    <div v-if="currentModal === 'meditation'" class="modal-overlay">
      <MeditationLog
        @log-submitted="payload => onSubmit(payload)"
        @close="() => closeModal('meditation')"
      />
    </div>

    <div v-if="currentModal === 'reading'" class="modal-overlay">
      <ReadingLog
        @log-submitted="payload => onSubmit(payload)"
        @close="() => closeModal('reading')"
      />
    </div>

    <div v-if="currentModal === 'cleaning'" class="modal-overlay">
      <CleaningLog
        @log-submitted="payload => onSubmit(payload)"
        @close="() => closeModal('cleaning')"
      />
    </div>

    <div v-if="currentModal === 'meal'" class="modal-overlay">
      <MealLog
        @log-submitted="payload => onSubmit(payload)"
        @close="() => closeModal('meal')"
      />
    </div>

    <div v-if="currentModal === 'adultBath'" class="modal-overlay">
      <AdultBathLog
        @log-submitted="payload => onSubmit(payload)"
        @close="() => closeModal('adultBath')"
      />
    </div>

    <div v-if="currentModal === 'babyBath'" class="modal-overlay">
      <BabyBathLog
        @log-submitted="payload => onSubmit(payload)"
        @close="() => closeModal('babyBath')"
      />
    </div>

    <div v-if="currentModal === 'generic'" class="modal-overlay">
      <GenericHabitLog
        @log-submitted="payload => onSubmit(payload)"
        @close="() => closeModal('generic')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DiaperChangeLog from './logs/DiaperChangeLog.vue';
import FeedingLog from './logs/FeedingLog.vue';
import DrinkingWaterLogs from './logs/DrinkingWaterLogs.vue';
import ExerciseLogs from './logs/ExerciseLogs.vue';
import GenericHabitLog from './logs/GenericHabitLog.vue';
import MeditationLog from './logs/MeditationLog.vue';
import ReadingLog from './logs/ReadingLog.vue';
import SleepingLog from './logs/SleepingLog.vue';
import MealLog from './logs/MealLog.vue';
import AdultBathLog from './logs/AdultBathLog.vue';
import BabyBathLog from './logs/BabyBathLog.vue';
import CleaningLog from './logs/CleaningLog.vue';

const emit = defineEmits(['close', 'logged']);

const currentModal = ref(null);
const selectedHabit = ref(null);
const loading = ref(false);
const error = ref('');

// map habit.category to modal key
const categoryToModal = (category = '') => {
  if (category.includes('diaperChange')) return 'diaper';
  if (category.includes('feeding')) return 'feeding';
  if (category.includes('drinkingWater')) return 'drinkingWater';
  if (category.includes('exercise')) return 'exercise';
  if (category.includes('sleeping')) return 'sleeping';
  if (category.includes('meditation')) return 'meditation';
  if (category.includes('reading')) return 'reading';
  if (category.includes('cleaning')) return 'cleaning';
  if (category.includes('meal')) return 'meal';
  if (category.includes('adultBath')) return 'adultBath';
  if (category.includes('babyBath')) return 'babyBath';
  return 'generic';
};

// parent can call logManager.value.openModal(habit)
const openModal = (habit) => {
  selectedHabit.value = habit;
  currentModal.value = categoryToModal(habit?.category || '');
  error.value = '';
};

// close modal and notify parent
const closeModal = (type = null) => {
  currentModal.value = null;
  selectedHabit.value = null;
  emit('close', type);
};

// submit payload coming from child modal component
const onSubmit = async (payload) => {
  if (!selectedHabit.value) {
    console.warn('No selected habit for log submission');
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { notes, ...extraFields } = payload || {};
    const body = {
      habit_log: {
        habit_id: selectedHabit.value.id,
        profile_id: selectedHabit.value.profile_id || (JSON.parse(localStorage.getItem('profile') || '{}')).id,
        log_date: today,
        notes: notes || '',
        extra_data: { ...extraFields }
      }
    };
    const resp = await fetch(`http://localhost:3000/habits/${selectedHabit.value.id}/habit_logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!resp.ok) {
      const errData = await resp.json().catch(()=>({ error: 'Failed' }));
      throw new Error(errData.error || 'Failed to save log');
    }
    // success: notify parent to refresh and close modal
    emit('logged', selectedHabit.value.id);
    closeModal();
  } catch (err) {
    error.value = err.message || 'Failed to save log';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

defineExpose({ openModal });
</script>

<style>
/* no styling */
</style>