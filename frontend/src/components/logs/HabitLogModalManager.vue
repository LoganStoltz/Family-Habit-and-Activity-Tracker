<template>
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div v-if="selectedHabit" class="modal-container">
      <!-- Route to category-specific log component -->
      <GenericHabitLog 
        v-if="!categoryHasSpecificLog"
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
      <SleepingLog 
        v-else-if="selectedHabit.category === 'sleeping'"
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
      <MealLog 
        v-else-if="selectedHabit.category === 'meals'"
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
      <MeditationLog 
        v-else-if="selectedHabit.category === 'meditation'"
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
      <ReadingLog 
        v-else-if="selectedHabit.category === 'reading'"
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
      <ExerciseLogs 
        v-else-if="selectedHabit.category === 'exercise'"
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
      <DrinkingWaterLogs 
        v-else-if="selectedHabit.category === 'drinkingWater'"
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
      <FeedingLog 
        v-else-if="selectedHabit.category === 'babyFeed'"
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
      <DiaperChangeLog 
        v-else-if="selectedHabit.category === 'diaper'"
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
      <BabyBathLog 
        v-else-if="selectedHabit.category === 'babyBath'"
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
      <AdultBathLog 
        v-else-if="selectedHabit.category === 'adultBath'"
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
      <CleaningLog 
        v-else-if="selectedHabit.category === 'cleaning'"
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
      <GenericHabitLog 
        v-else
        @log-submitted="handleLogSubmitted"
        @close="closeModal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { API_BASE_URL } from '@/config/api';
import GenericHabitLog from './GenericHabitLog.vue';
import SleepingLog from './SleepingLog.vue';
import MealLog from './MealLog.vue';
import MeditationLog from './MeditationLog.vue';
import ReadingLog from './ReadingLog.vue';
import ExerciseLogs from './ExerciseLogs.vue';
import DrinkingWaterLogs from './DrinkingWaterLogs.vue';
import FeedingLog from './FeedingLog.vue';
import DiaperChangeLog from './DiaperChangeLog.vue';
import BabyBathLog from './BabyBathLog.vue';
import AdultBathLog from './AdultBathLog.vue';
import CleaningLog from './CleaningLog.vue';

const showModal = ref(false);
const selectedHabit = ref(null);

// List of categories that have specific log components
const SPECIFIC_LOG_CATEGORIES = [
  'sleeping',
  'meals',
  'meditation',
  'reading',
  'exercise',
  'drinkingWater',
  'babyFeed',
  'diaper',
  'babyBath',
  'adultBath',
  'cleaning'
];

// Check if the current habit category has a specific log component
const categoryHasSpecificLog = computed(() => {
  return selectedHabit.value && SPECIFIC_LOG_CATEGORIES.includes(selectedHabit.value.category);
});

// Open modal for a specific habit
const openModal = (habit) => {
  selectedHabit.value = habit;
  showModal.value = true;
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  selectedHabit.value = null;
};

// Handle log submission from category-specific components
const handleLogSubmitted = async (logData) => {
  try {
    const payload = {
      logged_date: new Date().toISOString().split('T')[0],
      ...logData
    };

    const response = await fetch(
      `${API_BASE_URL}/habits/${selectedHabit.value.id}/habit_logs`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to log habit');
    }

    // Emit logged event with habitId
    emit('logged', selectedHabit.value.id);
    closeModal();
  } catch (err) {
    console.error('Error logging habit:', err);
    // You might want to add error handling here
  }
};

const emit = defineEmits(['logged', 'close']);

defineExpose({ openModal });
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>