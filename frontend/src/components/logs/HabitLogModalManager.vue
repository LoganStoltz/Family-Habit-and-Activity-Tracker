<template>
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <button class="modal-exit" type="button" @click="closeModal">&times;</button>
      <h2>Log Habit</h2>
      <form class="modal-form" @submit.prevent="submitLog">
        <div v-if="selectedHabit" class="habit-info">
          <p><strong>{{ selectedHabit.name }}</strong></p>
          <p v-if="selectedHabit.description" class="habit-description">{{ selectedHabit.description }}</p>
        </div>

        <div class="form-group">
          <label for="logDate">Date</label>
          <input 
            id="logDate" 
            v-model="logDate" 
            type="date" 
            required
          />
        </div>

        <div class="form-group">
          <label for="logNotes">Notes (optional)</label>
          <textarea 
            id="logNotes" 
            v-model="logNotes" 
            placeholder="Add any notes..."
            rows="3"
          ></textarea>
        </div>

        <div v-if="error" class="modal-error">{{ error }}</div>

        <div class="modal-actions">
          <button type="submit" class="modal-add" :disabled="loading">
            {{ loading ? 'Logging...' : 'Log Habit' }}
          </button>
          <button type="button" class="modal-cancel" @click="closeModal" :disabled="loading">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const showModal = ref(false);
const selectedHabit = ref(null);
const logDate = ref('');
const logNotes = ref('');
const loading = ref(false);
const error = ref('');

// Set today's date as default
const setTodayDate = () => {
  const today = new Date();
  logDate.value = today.toISOString().split('T')[0];
};

// Open modal for a specific habit
const openModal = (habit) => {
  selectedHabit.value = habit;
  logNotes.value = '';
  error.value = '';
  setTodayDate();
  showModal.value = true;
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  selectedHabit.value = null;
  logDate.value = '';
  logNotes.value = '';
  error.value = '';
};

// Submit log
const submitLog = async () => {
  if (!selectedHabit.value || !logDate.value) {
    error.value = 'Please fill in all required fields';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await fetch(
      `http://localhost:3000/habits/${selectedHabit.value.id}/habit_logs`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logged_date: logDate.value,
          notes: logNotes.value || null
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to log habit');
    }

    // Emit logged event with habitId
    emit('logged', selectedHabit.value.id);
    closeModal();
  } catch (err) {
    error.value = err.message || 'An error occurred';
    console.error('Error logging habit:', err);
  } finally {
    loading.value = false;
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

.modal {
  position: relative;
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 12px 40px rgba(30, 41, 59, 0.25);
  animation: modalSlideIn 0.3s ease-out;
}

.modal-exit {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #f3f3f3;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-exit:hover {
  color: #4f9dff;
  transform: rotate(90deg);
}

.modal h2 {
  color: #f3f3f3;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-weight: 600;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.habit-info {
  background: rgba(79, 157, 255, 0.1);
  border-left: 4px solid #4f9dff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.habit-info p {
  margin: 0.5rem 0;
  color: #f3f3f3;
}

.habit-description {
  font-size: 0.9rem;
  color: rgba(243, 243, 243, 0.7);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #f3f3f3;
  font-weight: 600;
  font-size: 0.95rem;
}

.modal-form input,
.modal-form textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: #f3f3f3;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.modal-form input::placeholder,
.modal-form textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.modal-form input:focus,
.modal-form textarea:focus {
  outline: none;
  border-color: #4f9dff;
  box-shadow: 0 0 0 3px rgba(79, 157, 255, 0.1);
  background: rgba(0, 0, 0, 0.5);
}

.modal-error {
  background: rgba(230, 57, 70, 0.15);
  color: #ff6b6b;
  border: 1px solid rgba(230, 57, 70, 0.3);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.modal-add,
.modal-cancel {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-family: 'Inter', sans-serif;
  flex: 1;
}

.modal-add {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
}

.modal-add:hover:not(:disabled) {
  background: linear-gradient(135deg, #74ebd5, #4f9dff);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 157, 255, 0.5);
}

.modal-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #f3f3f3;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.modal-cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.modal-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>