<template>
  <div class="habits-page">
    <div class="page-header">
      <h2>{{ profile.firstName }}'s Habits & Care</h2>
    </div>

    <div class="habits-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Habits & Care</h1>
        <div class="dashboard-actions">
          <button class="dashboard-btn add-habit" @click="showAddHabit = true">+ Add Habit</button>
          <button v-if="profile.profile_type === 'Baby'" class="dashboard-btn log-baby">
            🍼 Log Baby Milestones
          </button>
        </div>
      </div>

      <!-- Habits Cards -->
      <div class="dashboard-cards">
        <div v-for="habit in filteredHabits" :key="habit.id" class="dashboard-card">
          <div class="card-header">
            <span class="card-title">{{ habit.name }}</span>
          </div>
          <div class="card-progress">
            <div class="progress-label">
              {{ habitLogs[habit.id]?.length || 0 }} logged
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="progressStyle(habit)"></div>
            </div>
          </div>
          <div class="card-action-row">
            <button
              class="card-action-btn"
              :style="actionBtnStyle(habit)"
              @click="handleIncrement(habit)"
              :disabled="incrementing[habit.id]"
            >
              <span v-if="incrementing[habit.id]">Logging...</span>
              <span v-else>Log {{ habit.name }}</span>
            </button>
            <button 
              class="delete-habit-btn"
              @click="confirmDeleteHabit(habit)"
              :disabled="isDeleting[habit.id]"
            >
              {{ isDeleting[habit.id] ? 'Deleting...' : 'Delete Habit' }}
            </button>
          </div>
          <div v-if="incrementError[habit.id]" class="card-error">{{ incrementError[habit.id] }}</div>
        </div>
      </div>

      <!-- Reusable Confirmation Modal -->
      <ConfirmDeleteModal
        v-if="showConfirmModal"
        :title="'Delete Habit?'"
        :message="`Are you sure you want to delete <strong>${habitToDelete?.name}</strong>?`"
        :warning="'This action cannot be undone!'"
        :loading="isDeleting[habitToDelete?.id]"
        :confirmText="'Yes, Delete'"
        :cancelText="'Cancel'"
        :loadingText="'Deleting...'"
        @confirm="() => removeHabit(habitToDelete.id)"
        @cancel="cancelDelete"
      />

      <!-- Add Habit Modal -->
      <div v-if="showAddHabit" class="modal-overlay">
        <div class="modal">
          <h2>Add New Habit</h2>
          <form @submit.prevent="addHabit" class="modal-form">
            <input v-model="newHabitName" placeholder="New habit name" required />
            <input v-model="newHabitDescription" placeholder="Description" />
            <div v-if="addError" class="modal-error">{{ addError }}</div>
            <div class="modal-actions">
              <button type="submit" class="modal-add" :disabled="isAdding">
                {{ isAdding ? 'Adding...' : 'Add' }}
              </button>
              <button type="button" class="modal-cancel" @click="showAddHabit = false">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Log Modals -->
      <div v-if="showDiaperModal" class="modal-overlay">
        <DiaperChangeLog @log-submitted="submitDiaperLog" @close="showDiaperModal = false" />
      </div>
      <div v-if="showFeedingModal" class="modal-overlay">
        <FeedingLog @log-submitted="submitFeedingLog" @close="showFeedingModal = false" />
      </div>
      <div v-if="showDrinkingWaterModal" class="modal-overlay">
        <DrinkingWaterLogs @log-submitted="submitDrinkingWaterLog" @close="showDrinkingWaterModal = false" />
      </div>
      <div v-if="showGenericModal" class="modal-overlay">
        <GenericHabitLog @log-submitted="submitGenericLog" @close="showGenericModal = false" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import DiaperChangeLog from './logs/DiaperChangeLog.vue';
import FeedingLog from './logs/FeedingLog.vue';
import DrinkingWaterLogs from './logs/DrinkingWaterLogs.vue';
import GenericHabitLog from './logs/GenericHabitLog.vue';
import ConfirmDeleteModal from './ConfirmDeleteModal.vue';

export default {
  components: { DiaperChangeLog, FeedingLog, DrinkingWaterLogs, GenericHabitLog, ConfirmDeleteModal },
  setup() {
    // State
    const habits = ref([]);
    const habitLogs = ref({});
    const newHabitName = ref('');
    const newHabitDescription = ref('');
    const showAddHabit = ref(false);
    const isAdding = ref(false);
    const isDeleting = ref({});
    const habitToDelete = ref(null);
    const addError = ref('');
    const incrementing = ref({});
    const incrementError = ref({});
    const showConfirmModal = ref(false);
    const showDiaperModal = ref(false);
    const showFeedingModal = ref(false);
    const showDrinkingWaterModal = ref(false);
    const showGenericModal = ref(false);
    const selectedHabit = ref(null);

    // User/Profile
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id;
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    const profileId = profile?.id;

    // Fetch habits for current profile
    const fetchHabits = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}/profiles/${profileId}/habits`);
        const data = await response.json();
        habits.value = data;
        for (const habit of data) {
          await fetchLogs(habit.id);
        }
      } catch (err) {
        console.error('Failed to fetch habits:', err);
      }
    };

    // Fetch logs for a habit
    const fetchLogs = async (habitId) => {
      try {
        const response = await fetch(`http://localhost:3000/habits/${habitId}/habit_logs`);
        const data = await response.json();
        habitLogs.value[habitId] = data;
      } catch (err) {
        habitLogs.value[habitId] = [];
      }
    };

    // Add a new habit
    const addHabit = async () => {
      isAdding.value = true;
      addError.value = '';
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}/profiles/${profileId}/habits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            habit: {
              profile_id: profileId,
              name: newHabitName.value,
              description: newHabitDescription.value
            }
          })
        });
        if (!response.ok) {
          const errorData = await response.json();
          addError.value = errorData.error || 'Failed to add habit';
          throw new Error(addError.value);
        }
        newHabitName.value = '';
        newHabitDescription.value = '';
        showAddHabit.value = false;
        await fetchHabits();
      } catch (err) {
        addError.value = err.message || 'Failed to add habit.';
      } finally {
        isAdding.value = false;
      }
    };

    // Show confirmation modal
    const confirmDeleteHabit = (habit) => {
      habitToDelete.value = habit;
      showConfirmModal.value = true;
    };

    // Cancel deletion
    const cancelDelete = () => {
      habitToDelete.value = null;
      showConfirmModal.value = false;
    };

    // Remove a habit
    const removeHabit = async (habitId) => {
      isDeleting.value[habitId] = true;
      try {
        const response = await fetch(`http://localhost:3000/habits/${habitId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          throw new Error('Failed to delete habit');
        }
        await fetchHabits();
      } catch (err) {
        console.error('Error deleting habit:', err);
      } finally {
        isDeleting.value[habitId] = false;
        cancelDelete();
      }
    };

    // Open correct modal for logging
    const handleIncrement = (habit) => {
      selectedHabit.value = habit;
      if (habit.name.includes('Diaper Change')) {
        showDiaperModal.value = true;
      } else if (habit.name.includes('Feeding')) {
        showFeedingModal.value = true;
      } else if (habit.name.includes('Drink Water')) {
        showDrinkingWaterModal.value = true;
      } else {
        showGenericModal.value = true;
      }
    };

    // Log submission handlers
    const submitDiaperLog = async (logData) => {
      showDiaperModal.value = false;
      await submitHabitLog(selectedHabit.value, logData);
    };
    const submitFeedingLog = async (logData) => {
      showFeedingModal.value = false;
      await submitHabitLog(selectedHabit.value, logData);
    };
    const submitDrinkingWaterLog = async (logData) => {
      showDrinkingWaterModal.value = false;
      await submitHabitLog(selectedHabit.value, logData);
    };
    const submitGenericLog = async (logData) => {
      showGenericModal.value = false;
      await submitHabitLog(selectedHabit.value, logData);
    };

    // Unified log submitter
    const submitHabitLog = async (habit, logData) => {
      incrementing.value[habit.id] = true;
      incrementError.value[habit.id] = '';
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { notes, ...extraFields } = logData;
        const payload = {
          habit_log: {
            habit_id: habit.id,
            profile_id: profileId,
            log_date: today,
            notes: notes || '',
            extra_data: { ...extraFields } // All custom fields go here
          }
        };
        const response = await fetch(`http://localhost:3000/habits/${habit.id}/habit_logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errorData = await response.json();
          incrementError.value[habit.id] = errorData.error || 'Failed to log.';
          throw new Error(incrementError.value[habit.id]);
        }
        await fetchLogs(habit.id);
        await fetchHabits();
      } catch (err) {
        incrementError.value[habit.id] = err.message || 'Failed to log.';
      } finally {
        incrementing.value[habit.id] = false;
        selectedHabit.value = null;
      }
    };

    // Progress bar style (just shows % of logs, always 100% if at least one log)
    const progressStyle = (habit) => {
      const logs = habitLogs.value[habit.id] || [];
      const percent = logs.length > 0 ? 100 : 0;
      return `width: ${percent}%; background: #4f9dff; height: 8px; border-radius: 8px;`;
    };

    // Action button style
    const actionBtnStyle = (habit) => {
      const colors = ['#4f9dff', '#74ebd5', '#a78bfa', '#ffd166', '#ff8fa3'];
      const idx = habit.id % colors.length;
      return `background: ${colors[idx]}; color: #fff; font-weight: 600; border-radius: 8px; padding: 0.7rem 1.2rem; font-size: 1rem; box-shadow: 0 2px 8px rgba(79,157,255,0.10);`;
    };

    // Computed habits
    const filteredHabits = computed(() => habits.value);

    onMounted(fetchHabits);

    return {
      habits,
      profile,
      filteredHabits,
      habitLogs,
      newHabitName,
      newHabitDescription,
      addHabit,
      addError,
      isAdding,
      showAddHabit,
      confirmDeleteHabit,
      cancelDelete,
      removeHabit,
      habitToDelete,
      showConfirmModal,
      isDeleting,
      handleIncrement,
      incrementing,
      incrementError,
      submitDrinkingWaterLog,
      submitDiaperLog,
      submitFeedingLog,
      submitGenericLog,
      submitHabitLog,
      showDiaperModal,
      showFeedingModal,
      showGenericModal,
      showDrinkingWaterModal,
      progressStyle,
      actionBtnStyle,
    };
  }
}
</script>

<style>
.page-header {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: linear-gradient(90deg, #4f9dff, #74ebd5);
  margin: 2rem 0 1rem 0;
}

.habits-dashboard {
  max-width: 1800px;
  margin: 2.5rem auto;
  padding: 2.5rem 2rem;
  background: linear-gradient(120deg, #f8fafc 70%, #e0f7fa 100%);
  border-radius: 36px;
  box-shadow: 0 8px 32px rgba(79,157,255,0.12);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}
.dashboard-header h1 {
  font-size: 2.7rem;
  font-weight: 800;
  background: linear-gradient(90deg, #4f9dff, #74ebd5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}
.dashboard-actions {
  display: flex;
  gap: 1.5rem;
}
.dashboard-btn {
  font-size: 1.12rem;
  font-weight: 700;
  border-radius: 12px;
  padding: 0.8rem 1.7rem;
  background: #fff;
  color: #4f9dff;
  border: 2px solid #e0e7ef;
  box-shadow: 0 2px 8px rgba(79,157,255,0.09);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.dashboard-btn.add-habit {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: #fff;
  border: none;
}
.dashboard-btn.log-baby {
  background: linear-gradient(135deg, #ffd166, #fff3cd);
  color: #a78bfa;
  border: none;
}
.dashboard-btn:hover {
  filter: brightness(1.12);
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
  margin-top: 1rem;
}
.dashboard-card {
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 4px 24px rgba(79,157,255,0.11);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  min-height: 220px;
  position: relative;
  transition: box-shadow 0.2s;
}
.dashboard-card:hover {
  box-shadow: 0 8px 32px rgba(79,157,255,0.18);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #4f9dff;
  margin-bottom: 0.5rem;
}
.card-title {
  font-size: 1.22rem;
  font-weight: 700;
}
.card-progress {
  margin-top: 0.2rem;
}
.progress-label {
  font-size: 1.05rem;
  color: #90a4ae;
  margin-bottom: 0.3rem;
}
.progress-bar {
  width: 100%;
  height: 10px;
  background: #e0e7ef;
  border-radius: 8px;
  overflow: hidden;
}
.progress-fill {
  height: 10px;
  border-radius: 8px;
  transition: width 0.3s;
}

.card-action-row {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.card-action-btn {
  font-size: 1.08rem;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  padding: 0.8rem 1.4rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(79,157,255,0.10);
  transition: background 0.2s;
}
.delete-habit-btn {
  background: linear-gradient(135deg, #e63946, #dc2626);
  color: white;
  border: none;
  padding: 0.8rem 1.4rem;
  border-radius: 10px;
  font-size: 1.08rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(230, 57, 70, 0.18);
}
.delete-habit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(230, 57, 70, 0.28);
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}
.delete-habit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.card-error {
  color: #d32f2f;
  font-size: 0.98rem;
  margin-top: 0.5rem;
  text-align: left;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(30, 41, 59, 0.45);
  backdrop-filter: blur(4px) brightness(0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Modal */
.modal {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(30,41,59,0.18);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  min-width: 340px;
  max-width: 95vw;
  color: #222;
  font-size: 1.15rem;
  font-weight: 500;
  text-align: center;
  border: 2px solid #4f9dff;
}
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}
.modal-form input, select {
  padding: 0.7rem;
  border-radius: 8px;
  border: 1.5px solid #b3c2d6;
  font-size: 1rem;
  background: #f6fafd;
}
.modal-form input::placeholder, select {
  color: #494949;
}
.modal-form select:valid {
  color: #000;
}
.modal-form input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #494949;
  margin-right: 0.6rem;
  vertical-align: middle;
  cursor: pointer;
  transition: box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(79,157,255,0.08);
}
.modal-form label[for="habitHasGoal"] {
  font-size: 1.08rem;
  font-weight: 400;
  color: #494949;
  vertical-align: middle;
  cursor: pointer;
  margin-bottom: 0;
  margin-right: 0.5rem;
}
.modal-error {
  color: #d32f2f;
  font-size: 0.98rem;
  margin-top: 0.5rem;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: center;
}
.modal-add {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  border: none;
  font-weight: 700;
  border-radius: 10px;
  padding: 0.7rem 1.5rem;
  cursor: pointer;
}
.modal-cancel {
  background: #e0e7ef;
  color: #4f9dff;
  border: none;
  font-weight: 700;
  border-radius: 10px;
  padding: 0.7rem 1.5rem;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 1200px) {
  .habits-dashboard {
    padding: 1.5rem 0.5rem;
    max-width: 100%;
  }
  .dashboard-cards {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}
@media (max-width: 800px) {
  .dashboard-header h1 {
    font-size: 2rem;
  }
  .dashboard-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .dashboard-card {
    padding: 1.2rem 0.7rem;
  }
}
</style>