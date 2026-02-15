<template>
  <div class="profile-settings-container">
    <div class="settings-card">
      <div class="header">
        <div class="title-block">
          <h1 class="title">Profile Settings</h1>
          <p class="subtitle">Keep your details fresh and accurate.</p>
        </div>
        <div class="profile-pill" v-if="currentProfile">
          <span class="pill-label">Current Profile</span>
          <span class="pill-name">{{ currentProfile.firstName }} {{ currentProfile.lastName }}</span>
        </div>
      </div>

      <h2 class="user-beware-message">I would not recommend changing profile types as it's not fully implemented!</h2>

      <div class="form-grid">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input
            id="firstName"
            v-model="editForm.firstName"
            type="text"
            placeholder="First name"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input
            id="lastName"
            v-model="editForm.lastName"
            type="text"
            placeholder="Last name"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="dob">Date of Birth</label>
          <input
            id="dob"
            v-model="editForm.dob"
            type="date"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="profileType">Profile Type</label>
          <select
            id="profileType"
            v-model="editForm.profile_type"
            class="form-input"
          >
            <option value="Adult">Adult</option>
            <option value="Baby">Baby</option>
          </select>
        </div>
      </div>

      <div class="form-actions">
        <button
          class="save-btn"
          @click="saveProfile"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button
          class="cancel-btn"
          @click="resetForm"
          :disabled="isSaving"
        >
          Cancel
        </button>
      </div>

      <div v-if="saveMessage" :class="['save-message', saveMessage.type]">
        {{ saveMessage.text }}
      </div>

      <div class="section-divider"></div>

      <div class="danger-zone">
        <div class="danger-copy">
          <h3>Danger Zone</h3>
          <p>Once you delete a profile, there is no going back. Please be certain.</p>
        </div>
        <button
          class="delete-profile-btn"
          @click="confirmDeleteProfile"
          :disabled="isDeleting"
        >
          {{ isDeleting ? 'Deleting...' : 'Delete Profile' }}
        </button>
      </div>
    </div>

    <!-- Reusable Confirmation Modal -->
    <ConfirmDeleteModal
      v-if="showConfirmModal"
      :title="'Delete Profile?'"
      :message="`Are you sure you want to delete <strong>${currentProfile?.firstName} ${currentProfile?.lastName}</strong>?`"
      :warning="'This action cannot be undone!'"
      :loading="isDeleting"
      :confirmText="'Yes, Delete'"
      :cancelText="'Cancel'"
      :loadingText="'Deleting...'"
      @confirm="deleteProfile"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { defineAsyncComponent } from 'vue';
import { API_BASE_URL } from '../../config/api.js';
const ConfirmDeleteModal = defineAsyncComponent(() => import('../Popups/ConfirmDeleteModal.vue'));

// Define profile type
interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  dob?: string;
  profile_type?: string;
}

// Reactive state
const currentProfile = ref<Profile | null>(null);
const showConfirmModal = ref(false);
const isDeleting = ref(false);
const isSaving = ref(false);
const saveMessage = ref<{ type: string; text: string } | null>(null);
const editForm = ref({
  firstName: '',
  lastName: '',
  dob: '',
  profile_type: ''
});
const router = useRouter();

// Load current profile on mount
onMounted(() => {
  const storedProfile = localStorage.getItem('profile');
  if (storedProfile) {
    currentProfile.value = JSON.parse(storedProfile);
    // Initialize edit form with current values
    if (currentProfile.value) {
      editForm.value = {
        firstName: currentProfile.value.firstName || '',
        lastName: currentProfile.value.lastName || '',
        dob: currentProfile.value.dob || '',
        profile_type: currentProfile.value.profile_type || 'Adult'
      };
    }
  } else {
    // If no profile is selected, redirect to profile select
    router.push('/profile-select');
  }
});

// Save profile changes
const saveProfile = async () => {
  if (!currentProfile.value) {
    saveMessage.value = { type: 'error', text: 'No profile selected' };
    return;
  }

  if (!editForm.value.firstName.trim()) {
    saveMessage.value = { type: 'error', text: 'First name is required' };
    return;
  }

  try {
    isSaving.value = true;
    saveMessage.value = null;

    // Get user info for API call
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      saveMessage.value = { type: 'error', text: 'User not logged in' };
      return;
    }

    // Make PUT request to backend
    const response = await fetch(
      `${API_BASE_URL}/users/${user.id}/profiles/${currentProfile.value.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          first_name: editForm.value.firstName,
          last_name: editForm.value.lastName,
          dob: editForm.value.dob,
          profile_type: editForm.value.profile_type
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    const updatedProfile = await response.json();

    // Update local storage with new profile data
    const newProfile = {
      id: updatedProfile.id,
      firstName: updatedProfile.first_name,
      lastName: updatedProfile.last_name,
      dob: updatedProfile.dob,
      profile_type: updatedProfile.profile_type
    };

    localStorage.setItem('profile', JSON.stringify(newProfile));
    currentProfile.value = newProfile;

    // Dispatch storage event to update Header and other components
    window.dispatchEvent(new Event('storage'));

    saveMessage.value = { type: 'success', text: 'Profile updated successfully!' };

    // Clear message after 3 seconds
    setTimeout(() => {
      saveMessage.value = null;
    }, 3000);
  } catch (error) {
    console.error('Error saving profile:', error);
    saveMessage.value = { type: 'error', text: 'Failed to save profile. Please try again.' };
  } finally {
    isSaving.value = false;
  }
};

// Reset form to current values
const resetForm = () => {
  if (currentProfile.value) {
    editForm.value = {
      firstName: currentProfile.value.firstName || '',
      lastName: currentProfile.value.lastName || '',
      dob: currentProfile.value.dob || '',
      profile_type: currentProfile.value.profile_type || 'Adult'
    };
  }
  saveMessage.value = null;
};

// Step 1: Show confirmation modal
const confirmDeleteProfile = () => {
  showConfirmModal.value = true;
};

// Step 2: Cancel deletion
const cancelDelete = () => {
  showConfirmModal.value = false;
};

// Step 3: Main delete function
const deleteProfile = async () => {
  if (!currentProfile.value) {
    alert('No profile selected to delete');
    return;
  }

  try {
    isDeleting.value = true;
    // Get user info for API call
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      alert('User not logged in!');
      return;
    }
    // Make DELETE request to backend
    const response = await fetch(
      `${API_BASE_URL}/users/${user.id}/profiles/${currentProfile.value.id}`, 
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete profile: ${response.status}`);
    }
    // Success: Clean up local storage and redirect
    localStorage.removeItem('profile');
    window.dispatchEvent(new Event('storage'));
    alert('Profile deleted successfully');
    router.push('/profile-select');
  } catch (error) {
    console.error('Error deleting profile:', error);
    alert('Failed to delete profile. Please try again.');
  } finally {
    isDeleting.value = false;
    showConfirmModal.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');

.profile-settings-container {
  font-family: 'Space Grotesk', sans-serif;
  background: var(--main-background-dark);
  min-height: calc(100vh - 4.5rem);
  padding: 2rem;
  color: var(--text-primary);
  margin: 0 auto;
  align-content: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.settings-card {
  background: rgba(10, 20, 30, 0.72);
  border-radius: 28px;
  padding: clamp(2rem, 3vw, 3.25rem);
  width: min(1100px, 100%);
  min-height: 70vh;
  margin: 0 auto;
  box-shadow: var(--box-shadow-default);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(14px);
  animation: fadeUp 0.5s ease;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title {
  font-size: clamp(2rem, 2.6vw, 2.8rem);
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.profile-pill {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 209, 102, 0.2), rgba(116, 235, 213, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.18);
  min-width: 300px;
}

.pill-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.pill-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.user-beware-message {
  background: rgba(255, 0, 0, 0.281);
  border: 1px solid rgba(255, 0, 0, 0.22);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-input {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(10, 20, 30, 0.5);
  color: var(--text-primary);
  backdrop-filter: blur(10px);
  transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
  font-family: 'Space Grotesk', sans-serif;
}

.form-input:focus {
  outline: none;
  border-color: rgba(116, 235, 213, 0.6);
  background: rgba(10, 20, 30, 0.7);
  box-shadow: 0 0 0 3px rgba(116, 235, 213, 0.16);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* Style date and select inputs with white icons */
.form-input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.form-input[type="date"]::-webkit-calendar-picker-indicator:hover {
  filter: invert(1) brightness(1.2);
}

select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 12px;
  padding-right: 2.5rem;
  cursor: pointer;
  transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
}

select.form-input:focus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 3L1 8h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
}

.save-btn {
  background: var(--heading-gradient);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(116, 235, 213, 0.25);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(116, 235, 213, 0.35);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.22);
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.save-message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  animation: slideIn 0.3s ease;
}

.save-message.success {
  background: rgba(76, 175, 80, 0.2);
  color: #4cb050;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.save-message.error {
  background: rgba(230, 57, 70, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(230, 57, 70, 0.3);
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
  margin: 2rem 0;
}

.danger-zone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  background: rgba(255, 102, 102, 0.08);
  border: 1px solid rgba(255, 102, 102, 0.35);
  border-radius: 18px;
  padding: 1.5rem;
}

.danger-copy h3 {
  color: red;
  font-size: 1.35rem;
  margin-bottom: 0.5rem;
}

.danger-copy p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 1rem;
}

.delete-profile-btn {
  background: linear-gradient(135deg, #ff7b7b, #ff4d4d);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  box-shadow: 0 4px 18px rgba(255, 77, 77, 0.35);
}

.delete-profile-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(255, 77, 77, 0.5);
  background: linear-gradient(135deg, #ff5f5f, #e63946);
}

.delete-profile-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .profile-settings-container {
    padding: 1rem;
  }

  .settings-card {
    padding: 1.5rem;
    min-height: auto;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .danger-zone {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>