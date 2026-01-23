<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <button class="modal-exit" @click="$emit('close')">&times;</button>
      <h2>Register Profile</h2>

      <form class="modal-form" @submit.prevent="submitForm">
        <input 
          v-model="form.first_name" 
          placeholder="First Name" 
          type="text"
          required 
        />
        <input 
          v-model="form.last_name" 
          placeholder="Last Name" 
          type="text"
          required 
        />
        <input 
          v-model="form.dob" 
          placeholder="Date of Birth" 
          type="date"
          required 
        />
        <select v-model="form.profile_type" required>
          <option value="">Select Profile Type</option>
          <option value="Baby">Baby</option>
          <option value="Adult">Adult</option>
        </select>

        <div v-if="error" class="modal-error">{{ error }}</div>

        <div class="modal-actions">
          <button type="submit" class="modal-add" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Profile' }}
          </button>
          <button type="button" class="modal-cancel" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

// Define props
const props = defineProps<{
  hasExistingProfile?: boolean;
}>();

// Define emits
const emit = defineEmits(['profile-created', 'close']);

const form = reactive({
  first_name: '',
  last_name: '',
  dob: '',
  profile_type: ''
});

const loading = ref(false);
const error = ref('');

const submitForm = async () => {
  error.value = '';
  
  try {
    // Get the currently logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      error.value = 'User not logged in!';
      return;
    }

    loading.value = true;

    // POST request to nested route /users/:user_id/profiles
    const response = await fetch(`http://localhost:3000/users/${user.id}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: form }), // Wrap form data in 'profile' key
    });

    if (!response.ok) {
      const errorData = await response.json();
      error.value = errorData.errors?.[0] || errorData.error || 'Profile creation failed';
      return;
    }

    const data = await response.json();
    console.log('Profile created:', data);

    // Reset form
    form.first_name = '';
    form.last_name = '';
    form.dob = '';
    form.profile_type = '';

    // Emit the created profile and close modal
    console.log('About to emit profile-created with:', data.profile || data);
    emit('profile-created', data.profile || data);
    console.log('Emitted profile-created event');
    
  } catch (err) {
    console.error(err);
    error.value = err instanceof Error ? err.message : 'Something went wrong while creating the profile.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

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

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-form input,
.modal-form select {
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

.modal-form input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.modal-form input:focus,
.modal-form select:focus {
  outline: none;
  border-color: #4f9dff;
  box-shadow: 0 0 0 3px rgba(79, 157, 255, 0.1);
  background: rgba(0, 0, 0, 0.5);
}

.modal-form select {
  cursor: pointer;
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
}

.modal-add {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
  flex: 1;
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
  flex: 1;
}

.modal-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
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

@media (max-width: 480px) {
  .modal {
    padding: 1.5rem;
    max-width: 95vw;
  }

  .modal h2 {
    font-size: 1.5rem;
    margin-bottom: 1.2rem;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
