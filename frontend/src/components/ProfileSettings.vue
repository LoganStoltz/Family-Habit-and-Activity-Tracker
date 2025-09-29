<template>
    <div class="profile-settings-container">
        <h1 class="title">Profile Settings</h1>
        
        <div class="profile-info" v-if="currentProfile">
            <h2>Current Profile: {{ currentProfile.firstName }} {{ currentProfile.lastName }}</h2>
        </div>
        
        <div class="profile-settings-form">
            <!-- Future form elements for updating profile settings will go here -->
            
            <div class="danger-zone">
                <h3>Danger Zone</h3>
                <p>Once you delete a profile, there is no going back. Please be certain.</p>
                <button 
                    class="delete-profile-btn" 
                    @click="confirmDeleteProfile"
                    :disabled="isDeleting"
                >
                    {{ isDeleting ? 'Deleting...' : 'Delete Profile' }}
                </button>
            </div>
        </div>

        <!-- Confirmation Modal -->
        <div class="modal-overlay" v-if="showConfirmModal" @click="cancelDelete">
            <div class="confirmation-modal" @click.stop>
                <h3>Delete Profile?</h3>
                <p>Are you sure you want to delete <strong>{{ currentProfile?.firstName }} {{ currentProfile?.lastName }}</strong>?</p>
                <p class="warning">This action cannot be undone!</p>
                
                <div class="modal-actions">
                    <button class="cancel-btn" @click="cancelDelete">Cancel</button>
                    <button class="confirm-delete-btn" @click="deleteProfile">Yes, Delete</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

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
const router = useRouter();

// Load current profile on mount
onMounted(() => {
    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
        currentProfile.value = JSON.parse(storedProfile);
    } else {
        // If no profile is selected, redirect to profile select
        router.push('/profile-select');
    }
});

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
            `http://localhost:3000/users/${user.id}/profiles/${currentProfile.value.id}`, 
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to delete profile: ${response.status}`);
        }

        // Success: Clean up local storage and redirect
        localStorage.removeItem('profile');
        
        // Notify other components of the change
        window.dispatchEvent(new Event('storage'));
        
        alert('Profile deleted successfully');
        
        // Redirect to profile select page
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

.delete-profile-btn {
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

.delete-profile-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(230, 57, 70, 0.5);
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.delete-profile-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.confirmation-modal {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-large);
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  backdrop-filter: blur(20px);
  box-shadow: var(--box-shadow-hover);
  animation: modalSlideIn 0.3s ease-out;
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

.confirmation-modal h3 {
  color: #ff6b6b;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.confirmation-modal p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.warning {
  color: #ff6b6b !important;
  font-weight: 600;
  margin-bottom: 2rem !important;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.confirm-delete-btn {
  background: linear-gradient(135deg, #e63946, #dc2626);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);
}

.confirm-delete-btn:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(230, 57, 70, 0.5);
}

@media (max-width: 768px) {
  .profile-settings-container {
    padding: 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .confirmation-modal {
    padding: 2rem;
    margin: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .confirm-delete-btn {
    width: 100%;
  }
}
</style>