<template>
  <div class="user-settings-container">
    <div class="settings-card">
      <div class="header">
        <div class="title-block">
          <h1 class="title">User Settings</h1>
          <p class="subtitle">Manage your account information.</p>
        </div>
        <div class="user-pill" v-if="currentUser">
          <span class="pill-label">Current User</span>
          <span class="pill-name">{{ currentUser.first_name }} {{ currentUser.last_name }}</span>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input
            id="firstName"
            v-model="editForm.first_name"
            type="text"
            placeholder="First name"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input
            id="lastName"
            v-model="editForm.last_name"
            type="text"
            placeholder="Last name"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="editForm.email"
            type="email"
            placeholder="email@example.com"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="phone_number">Phone (Optional)</label>
          <input
            id="phone_number"
            v-model="editForm.phone_number"
            type="tel"
            placeholder="(555) 555-5555"
            class="form-input"
          />
        </div>
      </div>

      <div class="form-actions">
        <button
          class="save-btn"
          @click="saveUser"
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
          <p>Once you delete your account, there is no going back. Please be certain.</p>
        </div>
        <button
          class="delete-user-btn"
          @click="confirmDeleteUser"
          :disabled="isDeleting"
        >
          {{ isDeleting ? 'Deleting...' : 'Delete Account' }}
        </button>
      </div>
    </div>

    <!-- Reusable Confirmation Modal -->
    <ConfirmDeleteModal
      v-if="showConfirmModal"
      :title="'Delete Account?'"
      :message="`Are you sure you want to delete <strong>${currentUser?.first_name} ${currentUser?.last_name}</strong>?`"
      :warning="'This action cannot be undone!'"
      :loading="isDeleting"
      :confirmText="'Yes, Delete'"
      :cancelText="'Cancel'"
      :loadingText="'Deleting...'"
      @confirm="deleteUser"
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

// Define user type
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
}

// Reactive state
const currentUser = ref<User | null>(null);
const showConfirmModal = ref(false);
const isDeleting = ref(false);
const isSaving = ref(false);
const saveMessage = ref<{ type: string; text: string } | null>(null);
const editForm = ref<Pick<User, 'first_name' | 'last_name' | 'email' | 'phone_number'>>({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: ''
});

const router = useRouter();

// Load current user on mount
const isLoading = ref(true);
onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    currentUser.value = JSON.parse(storedUser);
    // Initialize edit form with current values
    if (currentUser.value) {
      editForm.value = {
        first_name: currentUser.value.first_name || '',
        last_name: currentUser.value.last_name || '',
        email: currentUser.value.email || '',
        phone_number: currentUser.value.phone_number || ''
      };
    }
  } else {
    // If no user is logged in, redirect to login
    router.push('/login');
  }
  isLoading.value = false;
});

// Save user changes
const saveUser = async () => {
  if (!currentUser.value) {
    saveMessage.value = { type: 'error', text: 'No user logged in' };
    return;
  }

  if (!editForm.value.first_name.trim()) {
    saveMessage.value = { type: 'error', text: 'First name is required' };
    return;
  }

  if (!editForm.value.email.trim()) {
    saveMessage.value = { type: 'error', text: 'Email is required' };
    return;
  }

  try {
    isSaving.value = true;
    saveMessage.value = null;

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          first_name: editForm.value.first_name,
          last_name: editForm.value.last_name,
          email: editForm.value.email,
          phone_number: editForm.value.phone_number
        }
      })
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Failed to update user: ${response.status} ${text}`);
    }

    const updatedUser = await response.json();

    const newUser = {
      id: updatedUser.id,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      phone_number: updatedUser.phone_number
    };

    localStorage.setItem('user', JSON.stringify(newUser));
    currentUser.value = newUser;
    window.dispatchEvent(new Event('storage'));

    saveMessage.value = { type: 'success', text: 'User updated successfully!' };
    setTimeout(() => (saveMessage.value = null), 3000);
  } catch (err) {
    console.error('Error saving user:', err);
    let message = 'Failed to save user. Please try again.';
    if (err instanceof Error) {
      message = err.message;
    }
    saveMessage.value = { type: 'error', text: message };
  } finally {
    isSaving.value = false;
  }
};

// Reset form to current values
const resetForm = () => {
  if (currentUser.value) {
    editForm.value = {
      first_name: currentUser.value.first_name || '',
      last_name: currentUser.value.last_name || '',
      email: currentUser.value.email || '',
      phone_number: currentUser.value.phone_number || ''
    };
  }
  saveMessage.value = null;
};

// Step 1: Show confirmation modal
const confirmDeleteUser = () => {
  showConfirmModal.value = true;
};

// Step 2: Cancel deletion
const cancelDelete = () => {
  showConfirmModal.value = false;
};

// Step 3: Main delete function
const deleteUser = async () => {
  if (!currentUser.value) {
    alert('No user selected to delete');
    return;
  }

  try {
    isDeleting.value = true;
    // Make DELETE request to backend
    const response = await fetch(
      `${API_BASE_URL}/users/${currentUser.value.id}`,
      {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
    // Success: Clear ALL localStorage to log out
    localStorage.clear();
    // Dispatch storage event to notify other tabs
    window.dispatchEvent(new Event('storage'));
    
    alert('User deleted successfully');
    // Redirect to login
    await router.push('/login');
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Failed to delete user. Please try again.');
  } finally {
    isDeleting.value = false;
    showConfirmModal.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');

.user-settings-container {
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

.user-pill {
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

.delete-user-btn {
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

.delete-user-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(255, 77, 77, 0.5);
  background: linear-gradient(135deg, #ff5f5f, #e63946);
}

.delete-user-btn:disabled {
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
  .user-settings-container {
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