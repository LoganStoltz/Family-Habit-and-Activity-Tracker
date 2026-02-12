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

<style src="../../assets/modal.css"></style>
<style scoped>
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
