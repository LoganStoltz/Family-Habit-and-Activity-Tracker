<template>
  <div class="profile-settings-container">
    <h1 class="title">User Settings</h1>
    
    <div class="profile-info" v-if="currentUser">
      <h2>Current User: {{ currentUser.first_name }} {{ currentUser.last_name }}</h2>
    </div>
    
    <div class="profile-settings-form">
      <!-- Future form elements for updating profile settings will go here -->
      <div class="danger-zone">
        <h3>Danger Zone</h3>
        <p>Once you delete a user, there is no going back. Please be certain.</p>
        <button 
          class="delete-user-btn" 
          @click="confirmDeleteUser"
          :disabled="isDeleting"
        >
          {{ isDeleting ? 'Deleting...' : 'Delete User' }}
        </button>
      </div>
    </div>

    <!-- Reusable Confirmation Modal -->
    <ConfirmDeleteModal
      v-if="showConfirmModal"
      :title="'Delete User?'"
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
const ConfirmDeleteModal = defineAsyncComponent(() => import('../Popups/ConfirmDeleteModal.vue'));

// Define user type
interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
}

// Reactive state
const currentUser = ref<User | null>(null);
const showConfirmModal = ref(false);
const isDeleting = ref(false);
const router = useRouter();

// Load current user on mount
onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
        currentUser.value = JSON.parse(storedUser);
  } else {
    // If no profile is selected, redirect to profile select
    router.push('/');
  }
});

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
    // Get user info for API call
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      alert('User not logged in!');
      return;
    }
    // Make DELETE request to backend
    const response = await fetch(
      `http://localhost:3000/users/${currentUser.value.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
    // Success: Clean up local storage and redirect
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    alert('User deleted successfully');
    router.push('/profile-select');
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.profile-settings-container {
  font-family: 'Inter', sans-serif;
  background: var(--main-background-dark);
  min-height: calc(100vh - 4.5rem);
  padding: 2rem;
  color: var(--text-primary);
  margin: 0 auto;
  align-content: center;
  display: flex;
  flex-direction: column;
}

.title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.profile-info {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: var(--box-shadow-default);
  width: 800px;
  margin: 2rem auto;
  
}

.profile-info h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.profile-settings-form {
  border-radius: var(--radius-large);
  margin: 0 auto;
  width: 800px;
}

.danger-zone {
  background: rgba(230, 57, 70, 0.1);
  border: 2px solid rgba(230, 57, 70, 0.3);
  border-radius: var(--radius-large);
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(10px);
}

.danger-zone h3 {
  color: #ff6b6b;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.danger-zone p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.delete-user-btn {
  background: linear-gradient(135deg, #e63946, #dc2626);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);
}

.delete-user-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(230, 57, 70, 0.5);
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.delete-user-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .profile-settings-container {
    padding: 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
}
</style>