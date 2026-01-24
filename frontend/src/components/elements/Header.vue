<template>
  <div>
    <header class="header">
    <!-- Desktop Navigation -->
      <nav class="nav">
        <router-link to="/" class="btn-home" v-if="!profile">Home</router-link>
        <router-link to="/profile-main" class="btn-profile-main" v-if="profile">Profile Main</router-link>
        <router-link to="/login" class="btn-login" v-if="!user">Login</router-link>
        <router-link to="/habits" class="btn-habits" v-if="user && profile">Habits</router-link>
        <router-link to="/activity-main" class="btn-activity-main" v-if="user && profile">Activity Main</router-link>
        <router-link to="/baby-milestones" class="btn-baby-milestones" v-if="user && profile && profile.profile_type === 'Baby'">Baby Milestones</router-link>
      </nav>
      <div class="user-section" v-if="user">
        <div class="user-menu-container">
          <div class="profile-header-name" @click="toggleDropdown">
            <div class="profile-avatar">{{ profile?.firstName?.charAt(0).toUpperCase() || '👤' }}</div>
            <div class="profile-info" v-if="profile">
              <div class="profile-name-text">{{ profile.firstName }}</div>
              <div class="profile-type-badge">{{ profile.profile_type || 'Adult' }}</div>
            </div>
            <div class="profile-info" v-else>
              <div class="profile-name-text">Select Profile</div>
              <div class="profile-type-badge">No Profile</div>
            </div>
            <div class="dropdown-arrow-icon" :class="{ open: isDropdownOpen }">▼</div>
          </div>
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <div class="dropdown-item" @click.stop="toggleProfileDropDown">
              <span class="dropdown-icon">👥</span>
              <span>Profile Select</span>
              <span class="dropdown-arrow" :class="{ expanded: isProfileDropDownOpen }">▼</span>
            </div>
            
            <!-- Profile options appear inline when expanded -->
            <div v-if="isProfileDropDownOpen" class="profile-dropdown">
              <div 
                class="profile-option" 
                v-for="option in profileOptions" 
                :key="option.id"
                @click="selectProfile(option)">
                <span class="profile-option-icon">👤</span>
                <span class="profile-option-name">{{ option.firstName }}</span>
              </div>
              <div class="profile-option add-profile" @click="openAddProfileModal">
                <span class="profile-option-icon">➕</span>
                <span class="profile-option-name">Add Profile</span>
              </div>
            </div>
            
            <div class="dropdown-item" @click="navigateTo('/profile-main')" v-if="profile">
              <span class="dropdown-icon">🏠</span>
              <span>Profile Main</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout-item" @click="logout">
              <span class="dropdown-icon">🚪</span>
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Profile Registration Modal -->
    <ProfileRegistration v-if="showProfileRegistration" @profile-created="handleProfileCreated" @close="showProfileRegistration = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import ProfileRegistration from '../Popups/ProfileRegistrationModal.vue';

const user = ref(null);
const profile = ref(null);
const profileOptions = ref([]);
const router = useRouter();
const isDropdownOpen = ref(false);
const isProfileDropDownOpen = ref(false);
const showProfileRegistration = ref(false);
let storageCheckInterval = null;

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) {
    fetchProfiles();
  }
};

const toggleProfileDropDown = (event) => {
  event?.stopPropagation();
  isProfileDropDownOpen.value = !isProfileDropDownOpen.value;
};

const openAddProfileModal = () => {
  isDropdownOpen.value = false;
  isProfileDropDownOpen.value = false;
  showProfileRegistration.value = true;
};

const handleProfileCreated = (profileData) => {
  console.log('Header: Profile created, received data:', profileData);
  
  // Auto-login to the newly created profile
  const newProfile = {
    id: profileData.id,
    firstName: profileData.first_name,
    lastName: profileData.last_name || '',
    dob: profileData.dob,
    profile_type: profileData.profile_type
  };
  
  console.log('Header: Formatted profile:', newProfile);
  
  localStorage.setItem('profile', JSON.stringify(newProfile));
  profile.value = newProfile;
  window.dispatchEvent(new Event('storage'));
  showProfileRegistration.value = false;
  router.push('/profile-main');
};

const navigateTo = (path) => {
  router.push(path);
  isDropdownOpen.value = false;
};

const updateFromStorage = () => {
  const storedUser = localStorage.getItem('user');
  const newUser = storedUser ? JSON.parse(storedUser) : null;
  if (JSON.stringify(newUser) !== JSON.stringify(user.value)) {
    console.log('Header: User changed from', user.value, 'to', newUser);
    user.value = newUser;
  }
  const storedProfile = localStorage.getItem('profile');
  profile.value = storedProfile ? JSON.parse(storedProfile) : null;
};

const fetchProfiles = async () => {
  if (!user.value?.id) return;
  
  try {
    const response = await fetch(`http://localhost:3000/users/${user.value.id}/profiles`);
    if (!response.ok) throw new Error('Failed to fetch profiles');
    const data = await response.json();
    
    profileOptions.value = Array.isArray(data)
      ? data.map(p => ({
          id: p.id,
          firstName: p.first_name,
          lastName: p.last_name || '',
          dob: p.dob,
          profile_type: p.profile_type
        }))
      : [];
  } catch (err) {
    console.error('Error fetching profiles:', err);
  }
};

const selectProfile = (selectedProfile) => {
  localStorage.setItem('profile', JSON.stringify(selectedProfile));
  profile.value = selectedProfile;
  window.dispatchEvent(new Event('storage'));
  isDropdownOpen.value = false;
  isProfileDropDownOpen.value = false;
  window.location.reload();
};

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('profile');
  user.value = null;
  profile.value = null;
  isDropdownOpen.value = false;
  router.push('/login');
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const userMenu = document.querySelector('.user-menu-container');
  if (userMenu && !userMenu.contains(event.target)) {
    isDropdownOpen.value = false;
    isProfileDropDownOpen.value = false;
  }
};

onMounted(() => {
  console.log('Header mounted');
  updateFromStorage();
  // Listen for storage events (from other tabs)
  window.addEventListener('storage', updateFromStorage);
  // Listen for custom user-logged-in event (from same tab)
  window.addEventListener('user-logged-in', updateFromStorage);
  document.addEventListener('click', handleClickOutside);
  
  // Poll localStorage every 100ms to catch changes immediately
  storageCheckInterval = setInterval(() => {
    updateFromStorage();
  }, 100);
});

onUnmounted(() => {
  window.removeEventListener('storage', updateFromStorage);
  window.removeEventListener('user-logged-in', updateFromStorage);
  document.removeEventListener('click', handleClickOutside);
  if (storageCheckInterval) clearInterval(storageCheckInterval);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

/* MAIN HEADER SECTION */
.header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 4.5rem;
  background: rgba(30, 66, 95, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: var(--transition-normal);
}

/* NAVIGATION BUTTONS (DESKTOP) */
.nav {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin: 0 1rem 0 0;
}

.nav a, .nav button {
  text-decoration: none;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-medium);
  transition: var(--transition-normal);
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
}

.nav a::before, .nav button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left var(--transition-normal);
}

.nav a:hover::before, .nav button:hover::before {
  left: 100%;
}

.nav a:hover, .nav button:hover {
  background: var(--accent-yellow);
  color: #1e3a5f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 209, 102, 0.3);
  border-color: var(--accent-yellow);
}

.nav a.router-link-active {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
}

.btn-logout {
  background: linear-gradient(135deg, #e63946, #dc2626);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-medium);
  cursor: pointer;
  transition: var(--transition-normal);
  box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);
}

.btn-logout:hover {
  background: var(--accent-yellow);
  color: #1e3a5f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 209, 102, 0.4);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu-container {
  position: relative;
}

.profile-header-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header-name:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
  box-shadow: 0 3px 10px rgba(79, 157, 255, 0.3);
  flex-shrink: 0;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  align-items: flex-start;
}

.profile-name-text {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  letter-spacing: 0.3px;
}

.profile-type-badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dropdown-arrow-icon {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.3s ease;
  margin-left: 0.25rem;
}

.dropdown-arrow-icon.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: rgba(30, 66, 95, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-medium);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  z-index: 1001;
  overflow: hidden;
  animation: dropdownSlide 0.2s ease-out;
}

.profile-dropdown {
  background: rgba(15, 40, 60, 0.98);
  border-left: 3px solid var(--accent-yellow);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 300px;
    opacity: 1;
  }
}

.profile-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem 0.75rem 2rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: 500;
  font-size: 0.95rem;
}

.profile-option:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--accent-yellow);
}

.profile-option.add-profile {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--accent-yellow);
  font-weight: 600;
}

.profile-option.add-profile:hover {
  background: rgba(255, 209, 102, 0.2);
}

.profile-option-name {
  flex: 1;
}

.profile-option-icon {
  font-size: 1rem;
  opacity: 0.8;
  margin-right: 0.25rem;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: 500;
  position: relative;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--accent-yellow);
}

.dropdown-arrow {
  margin-left: auto;
  font-size: 0.75rem;
  transition: transform 0.3s ease;
  opacity: 0.7;
}

.dropdown-arrow.expanded {
  transform: rotate(-180deg);
}

.dropdown-icon {
  font-size: 1.2rem;
  opacity: 0.9;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.25rem 0;
}

.logout-item:hover {
  background: rgba(230, 57, 70, 0.2);
  color: #ff6b7a;
}

/* Mobile responsiveness */
@media (max-width: 1000px) {
  .header {
    padding: 0 1rem;
    height: 4rem;
  }
  
  .nav {
    gap: 1rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .nav::-webkit-scrollbar {
    display: none;
  }
  
  .nav a, .nav button {
    font-size: 0.9rem;
    padding: 0.8rem 0.8rem;
    white-space: nowrap;
  }
  
  .profile-header-name {
    padding: 0.4rem 0.75rem;
    gap: 0.5rem;
  }
  
  .profile-avatar {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  
  .profile-name-text {
    font-size: 0.9rem;
  }
  
  .profile-type-badge {
    font-size: 0.65rem;
  }
}

@media (max-width: 800px) {
  .nav {
    gap: 0.5rem;
  }
  
  .nav a, .nav button {
    font-size: 1rem;
    padding: 0.8rem 0.8rem;
  }
}
</style>
