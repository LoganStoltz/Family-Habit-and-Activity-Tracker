<template>
  <div class="habitsPage">
    <div class="habitsContent">
      <div class="habitPanels">
        <div class="dashboardHeader">
          <button class="addHabitButton" @click="showAddNewHabit = true">Add Habit</button>
          <h1>Habits & Care</h1>
          <button class="editingModeButton" :class="{ active: toggleEditingMode }" @click="toggleEditingMode = !toggleEditingMode">✏️</button>
        </div>

        <!-- Habits Cards -->
        <div class="dashboard-cards">
          <template v-if="filteredHabits.length > 0">
            <HabitsCard
              v-for="habit in filteredHabits"
              :key="habit.id"
              :habit="habit"
              :logs="habitLogs[habit.id] || []"
              :incrementing="incrementing"
              :incrementError="incrementError"
              :isDeleting="isDeleting"
              @edit-habit="editHabit"
              @delete-habit="confirmDeleteHabit"
              @log-habit="handleIncrement"
              :toggleEditingMode="toggleEditingMode"
            />
          </template>
          <div v-else class="no-dashboard-cards">
            <p>No habits found. Please add a habit first.</p>
          </div>
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

      <!-- Premade or Custom Choice Modal -->
      <div v-if="showAddNewHabit" class="modal-overlay">
        <div class="modal">
          <button class="modal-exit" type="button" @click="showAddNewHabit = false">&times;</button>
          <h2>Premade or Custom Habit</h2>
          <form class="modal-form">
            <div class="modal-actions">
              <button type="button" class="modal-add" @click="showAddPreMadeHabit = true; showAddNewHabit = false">Premade</button>
              <button type="button" class="modal-add" style="background: linear-gradient(135deg, #a78bfa, #ffd166);" @click="showAddCustomHabit = true; showAddNewHabit = false">Custom</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Habit Modal (Custom) replaced by component -->
      <AddHabitModal
        v-if="showAddCustomHabit"
        :isPremade="false"
        :userId="userId"
        :profileId="profileId"
        @added="handleHabitAdded"
        @close="() => { showAddCustomHabit = false }"
      />

      <!-- Add Habit Modal (Premade) replaced by component -->
      <AddHabitModal
        v-if="showAddPreMadeHabit"
        :isPremade="true"
        :userId="userId"
        :profileId="profileId"
        @added="handleHabitAdded"
        @close="() => { showAddPreMadeHabit = false }"
      />

      <!-- Edit Habit Modal -->
      <EditHabitModal
        v-if="showEditModal"
        :habit="editTarget"
        @updated="handleHabitUpdated"
        @close="() => { showEditModal = false; editTarget = null }"
      />

      <!-- Log Modals -->
      <LogModalManager 
        ref="logManager"
        @close="handleLogModalClose"
        @logged="onLogged"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineExpose } from 'vue';
import HabitsCard from './HabitsCard.vue';
import ConfirmDeleteModal from './ConfirmDeleteModal.vue';
import LogModalManager from './LogModalManager.vue';
import AddHabitModal from './AddHabitModal.vue';
import EditHabitModal from './EditHabitModal.vue';

// State
const habits = ref([]);
const habitLogs = ref({});
const showAddCustomHabit = ref(false);
const showAddPreMadeHabit = ref(false);
const showAddNewHabit = ref(false);
const isDeleting = ref({});
const habitToDelete = ref(null);
const incrementing = ref({});
const incrementError = ref({});
const showConfirmModal = ref(false);

const showEditModal = ref(false);
const editTarget = ref(null);

const toggleEditingMode = ref(false);

const logManager = ref(null); // ref to LogModalManager

// User/Profile
const user = JSON.parse(localStorage.getItem('user') || '{}');
const userId = user?.id;
const profile = JSON.parse(localStorage.getItem('profile') || '{}'); // make profile a top-level const
const profileId = profile?.id;

// Open correct modal for logging — call LogModalManager.openModal
const handleIncrement = (habit) => {
  if (logManager.value && typeof logManager.value.openModal === 'function') {
    logManager.value.openModal(habit);
  } else {
    console.warn('LogModalManager not available');
  }
};

// Called after LogModalManager emits 'logged' with habitId
const onLogged = async (habitId) => {
  try {
    await fetchLogs(habitId);
    await fetchHabits();
  } catch (err) {
    console.error('Error refreshing logs after log saved', err);
  }
};


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

// Handler when AddHabitModal emits 'added'
const handleHabitAdded = async (created) => {
  // refresh habits and close modals (modal also emits close)
  try {
    await fetchHabits();
  } catch (err) {
    console.error('Failed to refresh habits after add:', err);
  } finally {
    showAddCustomHabit.value = false;
    showAddPreMadeHabit.value = false;
    showAddNewHabit.value = false;
  }
};

// Expose a method so parents can open the add-habit modal
const openAddHabit = () => {
  showAddNewHabit.value = true;
};

defineExpose({ openAddHabit });

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

// Computed habits
const filteredHabits = computed(() => habits.value);

onMounted(fetchHabits);

// update editHabit to open the edit modal
const editHabit = (habit) => {
  editTarget.value = habit;
  showEditModal.value = true;
  console.info('editHabit called for', habit);
};

// handler when EditHabitModal emits 'updated'
const handleHabitUpdated = async () => {
  try {
    await fetchHabits();
  } catch (err) {
    console.error('Failed to refresh habits after edit:', err);
  } finally {
    showEditModal.value = false;
    editTarget.value = null;
  }
};

// close handler used in the template for LogModalManager
const handleLogModalClose = (type) => {
  // placeholder: handle modal close events if you need side-effects
  console.info('Log modal closed:', type);
};
</script>

<style>
/* Habits Page Styling */
.habitsPage {
  max-width: 1400px;
  margin: 20px auto;
}

/* Habits & Care Section Styling */
.habitPanels {
  padding: 20px;
  margin: 0px 0px 20px 0px;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.dashboardButton {
  margin-right: 10px;
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
  text-decoration: none;
}

.dashboardButton.addHabit {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: #fff;
}

.dashboardButton.viewLogs {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: #fff;
}

.dashboardButton.logBaby {
  background: linear-gradient(135deg, #ffd166, #fff3cd);
  color: #a78bfa;
}

.dashboardButton:hover {
  filter: brightness(1.12);
  box-shadow: 0 6px 24px rgba(79,157,255,0.18);
}

.dashboardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  margin: -20px -20px 20px -20px;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  padding: 2px;
  border-radius: 12px 12px 0px 0px;
}

.dashboardHeader button {
  margin: 0px 20px;
}

.addHabitButton {
  background: rgba(255, 255, 255, 0.95);
  color: #4f9dff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-weight: 700;
  font-size: 1.08rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
}

.addHabitButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 1);
  border-color: rgba(255, 255, 255, 0.5);
}

.addHabitButton:active {
  transform: translateY(0px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.editingModeButton {
  font-size: 1.5rem;
  transition: var(--transition-normal);
  cursor: pointer;
  padding: 0.7rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
}

.editingModeButton:hover {
  background: rgba(0, 0, 0, 0.2);
}

.editingModeButton.active {
  background: rgba(0, 0, 0, 0.3);
}

.editingModeButton.active:hover {
  background: rgba(0, 0, 0, 0.2);
}

.no-dashboard-cards {
  text-align: center;
  color: #666;
  font-size: 1.6rem;
  font-weight: 600;
  margin-top: 2rem;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin: 20px;
}

.dashboard-card {
  background: #ffc5c5;
  border-radius: 8px;
}
.dashboard-card:hover {
  box-shadow: 0 8px 32px rgba(79,157,255,0.18);
}
.card-header {
  display: flex;
  gap: 0.7rem;
  font-size: 1.35rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  margin-bottom: 0.5rem;
}
.card-title {
  font-size: 1.22rem;
  font-weight: 700;
}
.card-progress {
  margin-top: 0.2rem;
}
.card-category {
  font-size: 1.12rem;
  color: #80b9ff;
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
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(79,157,255,0.18);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  min-width: 340px;
  max-width: 95vw;
  color: #222;
  font-size: 1.15rem;
  font-weight: 500;
  text-align: center;
  border: 2px solid #4f9dff;
  position: relative;
  animation: modalFadeIn 0.3s;
  display: flex;
  flex-direction: column;
}

.modal h2 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  background: linear-gradient(90deg, #4f9dff, #74ebd5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.modal-form input,
.modal-form select {
  padding: 0.8rem;
  border-radius: 10px;
  border: 1.5px solid #b3c2d6;
  font-size: 1.08rem;
  background: #f6fafd;
  margin-bottom: 0.5rem;
  transition: border 0.2s;
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
.modal-exit {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 2rem;
    color: #4f9dff;
    cursor: pointer;
    font-weight: bold;
    z-index: 10;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(30px) scale(0.98);}
  to { opacity: 1; transform: translateY(0) scale(1);}
}

/* Responsive */
@media (max-width: 1200px) {
  .habitPanels {
    max-width: 100%;
  }
  .dashboard-cards {
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .dashboardHeader {
    margin: -24px -20px 20px -20px;
    padding: 2px;
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