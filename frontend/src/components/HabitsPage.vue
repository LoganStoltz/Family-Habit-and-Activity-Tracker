<template>
  <div class="habits-dashboard">
    <div class="dashboard-header">
      <h1>Habits & Care</h1>
      <div class="dashboard-actions">
        <button class="dashboard-btn add-habit" @click="showAddHabit = true">+ Add Habit</button>
        <button class="dashboard-btn log-baby">🍼 Log Baby Activity</button>
      </div>
    </div>
    <div class="dashboard-cards">
      <div v-for="habit in filteredHabits" :key="habit.id" class="dashboard-card">
        <div class="card-header">
          <span class="card-title">{{ habit.name }}</span>
          <!-- Example icon: <span class="card-icon">💧</span> -->
        </div>
        <div class="card-progress">
          <div class="progress-label">{{ habitLogs[habit.id]?.length || 0 }}/{{ habit.goal_value }} {{ habit.goal_type }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="progressStyle(habit)"></div>
          </div>
        </div>
        <div class="card-action-row">
          <button class="card-action-btn" :style="actionBtnStyle(habit)" @click="handleIncrement(habit)" :disabled="incrementing[habit.id] || habit.completed || (habitLogs[habit.id]?.length >= habit.goal_value)">
            <span v-if="incrementing[habit.id]">Logging...</span>
            <span v-else>+1 {{ habit.name }}</span>
          </button>
          <span v-if="incrementError[habit.id]" style="color:#d32f2f; font-size:0.9rem; margin-left:0.5rem;">{{ incrementError[habit.id] }}</span>
        </div>
        <div class="card-streak">
          <span class="streak-icon">🔥</span>
          <span>{{ getStreak(habit.id) }}-day streak</span>
        </div>
        <div v-if="incrementError[habit.id]" class="card-error">{{ incrementError[habit.id] }}</div>
      </div>
    </div>
    <div v-if="showAddHabit" class="modal-overlay">
      <div class="modal">
        <h2>Add New Habit</h2>
        <form @submit.prevent="addHabit" class="modal-form">
          <input v-model="newHabitName" placeholder="New habit name" required />
          <input v-model="newHabitDescription" placeholder="Description" />
          <input v-model="newHabitGoalType" placeholder="Goal type (e.g. daily, weekly)" />
          <input v-model="newHabitGoalValue" type="number" placeholder="Goal value" />
          <div v-if="addError" class="modal-error">{{ addError }}</div>
          <div class="modal-actions">
            <button type="submit" class="modal-add" :disabled="isAdding">{{ isAdding ? 'Adding...' : 'Add' }}</button>
            <button type="button" class="modal-cancel" @click="showAddHabit = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
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
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import DiaperChangeLog from './logs/DiaperChangeLog.vue';
import FeedingLog from './logs/FeedingLog.vue';
import DrinkingWaterLogs from './logs/DrinkingWaterLogs.vue';
import GenericHabitLog from './logs/GenericHabitLog.vue';

export default {
  components: { DiaperChangeLog, FeedingLog, DrinkingWaterLogs, GenericHabitLog },
  setup() {
    const habits = ref([]);
    const habitLogs = ref({}); // { habitId: [logs] }
    const newHabitName = ref('');
    const newHabitDescription = ref('');
    const newHabitGoalType = ref('');
    const newHabitGoalValue = ref('');
    const showAddHabit = ref(false);
    const activeTab = ref('habits');
    const isAdding = ref(false);
    const addError = ref('');
    const incrementing = ref({}); // { habitId: boolean }
    const incrementError = ref({}); // { habitId: string }
    const showDiaperModal = ref(false);
    const showFeedingModal = ref(false);
    const showDrinkingWaterModal = ref(false);
    const showGenericModal = ref(false);
    const selectedHabit = ref(null);

    // Get current user and profile id
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id;
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    const profileId = profile?.id;

    // Fetch habits for current profile
    const fetchHabits = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}/profiles/${profileId}/habits`); // Updated URL
        const data = await response.json();
        habits.value = data;
        // Fetch logs for each habit
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
        const response = await fetch(`http://localhost:3000/habits/${habitId}/habit_logs`); // Updated URL
        const data = await response.json();
        habitLogs.value[habitId] = data;
      } catch (err) {
        habitLogs.value[habitId] = [];
      }
    };

    // Add a new habit to backend
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
              description: newHabitDescription.value,
              goal_type: newHabitGoalType.value,
              goal_value: newHabitGoalValue.value
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
        newHabitGoalType.value = '';
        newHabitGoalValue.value = '';
        showAddHabit.value = false;
        await fetchHabits(); // Refresh list
      } catch (err) {
        addError.value = err.message || 'Failed to add habit.';
      } finally {
        isAdding.value = false;
      }
    };

    // Open the correct modal for logging
    const handleIncrement = (habit) => {
      selectedHabit.value = habit;
      if (habit.name.includes('Diaper Change')) {
        showDiaperModal.value = true;
      } 
      else if (habit.name.includes('Feeding')) {
        showFeedingModal.value = true;
      } 
      else if (habit.name.includes('Drink Water')) {
        showDrinkingWaterModal.value = true;
      } 
      else {
        showGenericModal.value = true;
      }
    };

    // Handle log submission for each modal
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
        // Always include amount: 1 for habits that increment by count
        let amount = 1;
        // If logData.amount is provided (e.g., for custom logs), use it
        if (typeof logData.amount !== 'undefined') {
          amount = logData.amount;
        }
        const payload = {
          habit_log: {
            log_date: today,
            amount,
            ...logData
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
        
        // Check if habit meets goal
        const logs = habitLogs.value[habit.id] || [];
        if (logs.length >= habit.goal_value && !habit.completed) {
          await markHabitComplete(habit.id);
          habit.completed = true; // update locally
        }
      } catch (err) {
        incrementError.value[habit.id] = err.message || 'Failed to log.';
      } finally {
        incrementing.value[habit.id] = false;
        selectedHabit.value = null;
      }
    };

    const markHabitComplete = async (habitId) => {
      await fetch(`http://localhost:3000/habits/${habitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit: { completed: true } })
      });
    };

    // Progress bar style
    const progressStyle = (habit) => {
      const logs = habitLogs.value[habit.id] || [];
      const percent = Math.min(100, Math.round((logs.length / (habit.goal_value || 1)) * 100));
      return `width: ${percent}%; background: #4f9dff; height: 8px; border-radius: 8px;`;
    };

    // Action button style (color by habit)
    const actionBtnStyle = (habit) => {
      const colors = ['#4f9dff', '#74ebd5', '#a78bfa', '#ffd166', '#ff8fa3'];
      const idx = habit.id % colors.length;
      return `background: ${colors[idx]}; color: #fff; font-weight: 600; border-radius: 8px; padding: 0.7rem 1.2rem; font-size: 1rem; box-shadow: 0 2px 8px rgba(79,157,255,0.10);`;
    };

    // Streak calculation (mock: just logs count for now)
    const getStreak = (habitId) => {
      const logs = habitLogs.value[habitId] || [];
      return logs.length;
    };

    const filteredHabits = computed(() => habits.value.filter(h => h.name && h.goal_value));

    onMounted(fetchHabits);

    return {
      habits,
      filteredHabits,
      habitLogs,
      newHabitName,
      newHabitDescription,
      newHabitGoalType,
      newHabitGoalValue,
      addHabit,
      showAddHabit,
      activeTab,
      progressStyle,
      actionBtnStyle,
      getStreak,
      isAdding,
      addError,
      handleIncrement,
      incrementing,
      incrementError,
      showDiaperModal,
      showFeedingModal,
      showGenericModal,
      showDrinkingWaterModal,
      submitDrinkingWaterLog,
      submitDiaperLog,
      submitFeedingLog,
      submitGenericLog
    };
  }
}
</script>

<style>


.habits-dashboard {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2.5rem 1.5rem;
  background: linear-gradient(120deg, #f8fafc 60%, #e0f7fa 100%);
  border-radius: 32px;
  box-shadow: 0 8px 32px rgba(79,157,255,0.10);
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.dashboard-header h1 {
  font-size: 2.3rem;
  font-weight: 800;
  background: linear-gradient(90deg, #4f9dff, #74ebd5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.dashboard-actions {
  display: flex;
  gap: 1.2rem;
}
.dashboard-btn {
  font-size: 1.08rem;
  font-weight: 700;
  border-radius: 10px;
  padding: 0.7rem 1.5rem;
  background: #fff;
  color: #4f9dff;
  border: 2px solid #e0e7ef;
  box-shadow: 0 2px 8px rgba(79,157,255,0.07);
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
  filter: brightness(1.08);
}
.dashboard-tabs {
  display: flex;
  gap: 2rem;
  margin-bottom: 2.2rem;
  border-bottom: 2px solid #e0e7ef;
}
.tab {
  background: none;
  border: none;
  font-size: 1.15rem;
  font-weight: 700;
  color: #90a4ae;
  padding: 0.7rem 0.5rem;
  cursor: pointer;
  position: relative;
}
.tab.active {
  color: #4f9dff;
}
.tab.active::after {
  content: '';
  display: block;
  height: 3px;
  width: 100%;
  background: #4f9dff;
  border-radius: 2px;
  position: absolute;
  left: 0;
  bottom: -8px;
}
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
}
.dashboard-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(79,157,255,0.09);
  padding: 1.5rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  min-height: 220px;
  position: relative;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #4f9dff;
}
.card-title {
  font-size: 1.18rem;
  font-weight: 700;
}
.card-icon {
  font-size: 1.5rem;
}
.card-progress {
  margin-top: 0.2rem;
}
.progress-label {
  font-size: 1rem;
  color: #90a4ae;
  margin-bottom: 0.3rem;
}
.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e7ef;
  border-radius: 8px;
  overflow: hidden;
}
.progress-fill {
  height: 8px;
  border-radius: 8px;
  transition: width 0.3s;
}
.card-action-row {
  margin-top: 0.7rem;
  display: flex;
  justify-content: flex-start;
}
.card-action-btn {
  font-size: 1.05rem;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(79,157,255,0.10);
  transition: background 0.2s;
}
.card-streak {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #ff9800;
  font-weight: 600;
}
.streak-icon {
  font-size: 1.2rem;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(79,157,255,0.18);
  padding: 2rem 2.5rem;
  min-width: 320px;
  max-width: 90vw;
}
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}
.modal-form input {
  padding: 0.7rem;
  border-radius: 8px;
  border: 1.5px solid #b3c2d6;
  font-size: 1rem;
  background: #f6fafd;
}
.modal-error {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
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
@media (max-width: 900px) {
  .habits-dashboard {
    padding: 1rem 0.2rem;
    max-width: 100%;
  }
  .dashboard-cards {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  .dashboard-header h1 {
    font-size: 1.5rem;
  }
}
</style>