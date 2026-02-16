<template>
  <section class="HomePage-main-section">
    <!-- Welcome Section -->
    <div v-if="user" class="welcome-container">
      <div class="welcome-panel">
        <div class="welcome-identity">
          <div class="welcome-avatar">
            <span class="welcome-initial">
              {{ (user.first_name?.[0] || user.user_name?.[0] || user.email?.[0] || "U").toUpperCase() }}
            </span>
          </div>
          <div class="welcome-text">
            <p class="welcome-eyebrow">Glad you are back</p>
            <h1 class="welcome-heading">
              {{ (user.first_name + (user.last_name ? ', ' + user.last_name : '')) || user.user_name || user.email }}
            </h1>
            <p class="welcome-subtitle">Set the tone for the day and keep your family moving together.</p>
          </div>
        </div>

        <div class="welcome-actions" v-if="user">
          <router-link to="/activity-main" class="action-button primary" v-if="profile"> 
            <span>📊</span> Track Activity
          </router-link>
          <router-link to="/user-settings" class="action-button secondary">
            <span>👤</span>  User Settings
          </router-link>
          <router-link to="/profile-settings" class="action-button secondary" v-if="profile">
            <span>⚙️</span> Profile Settings
          </router-link>
        </div>

        <div class="welcome-cards">
          <div class="welcome-card">
            <p class="card-label">Today</p>
            <p class="card-value">Start with one win</p>
          </div>
          <div class="welcome-card">
            <p class="card-label">Focus</p>
            <p class="card-value">Family routines</p>
          </div>
          <div class="welcome-card">
            <p class="card-label">Momentum</p>
            <p class="card-value">Celebrate milestones</p>
          </div>
        </div>

        <div class="profile-welcome-section" v-if="profile">
          <div class="profile-panel-header">
            <span class="profile-panel-label">Selected Profile</span>
          </div>
          <h2 class="profile-panel-name">
            {{ profile.firstName }}{{ (profile.lastName ) ? ' ' + (profile.lastName) : '' }}
          </h2>
          <p class="profile-panel-note">Profiles help you personalize your experience and track specific habits and milestones.</p>
          <div class="profile-panel-meta">
            <span class="profile-panel-pill" v-if="profile.profile_type">
              {{ profile.profile_type}}
            </span>
            <span class="profile-panel-date" v-if="profile.dob">Born: {{ formatDate(profile.dob) }}</span>
          </div>
        </div>

        <div class="select-profile" v-if="user && !profile">
          <div class="select-profile-text">
            <h2 class="welcome-second-heading">Choose a profile to personalize your dashboard</h2>
            <p class="welcome-subtitle">No profiles yet? Create one to get started.</p>
          </div>
          <router-link to="/profile-select" class="btn-secondary">Select Profile</router-link>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <div v-if="!user" class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Family Habit & Activity Tracker</h1>
        <p class="hero-subtitle">Build stronger family bonds through shared goals and habits</p>
        <p class="hero-description">Track daily activities, celebrate milestones, and create lasting habits together. Perfect for families of all sizes.</p>
        <router-link to="/login" class="btn-hero">Get Started</router-link>
      </div>
      <div class="hero-features">
        <div class="hero-feature-item">
          <div class="feature-dot">✓</div>
          <span>Easy habit tracking</span>
        </div>
        <div class="hero-feature-item">
          <div class="feature-dot">✓</div>
          <span>Celebrate milestones</span>
        </div>
        <div class="hero-feature-item">
          <div class="feature-dot">✓</div>
          <span>Family insights & reports</span>
        </div>
      </div>
    </div>

    <!-- Feature Cards Sections-->
    <div v-if="user && profile" class="feature-section">
      <div class="quick-access-header">
        <h2>Your Progress</h2>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
            <h3>Active Habits</h3>
            <h4>{{ activeHabitsCount }}</h4>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔥</div>
            <h3>Current Streak</h3>
            <h4>{{ currentStreak }}</h4>
        </div>  
        <div class="feature-card">
          <div class="feature-icon">✅</div>
            <h3>Completed Today</h3>
            <h4>{{ completedToday }}</h4>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⭐</div>
            <h3>Total Logs & Milestones</h3>
            <h4>{{ totalAchievements }}</h4>
        </div>
      </div>
    </div>

    <div v-if="user && profile" class="feature-section">
      <div class="quick-access-header">
        <h2>Quick Access</h2>
      </div>
      <div class="features-grid">
        <router-link to="/habits" class="feature-card">
          <div class="feature-icon">📋</div>
          <h3>Habits & Care</h3>
          <p>Track daily habits and activities for your family members</p>
          <span class="arrow">→</span>
        </router-link>

        <router-link to="/baby-milestones" class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>Milestones</h3>
          <p>Set and celebrate important goals and achievements</p>
          <span class="arrow">→</span>
        </router-link>

        <router-link to="/activity-main" class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Activity Log</h3>
          <p>View comprehensive logs of family activities</p>
          <span class="arrow">→</span>
        </router-link>

        <router-link to="/profile-select" class="feature-card">
          <div class="feature-icon">👥</div>
          <h3>Profiles</h3>
          <p>Manage family member profiles and settings</p>
          <span class="arrow">→</span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { apiRequest } from '../../config/api'

interface Profile {
  id: number
  firstName: string
  lastName?: string
  dob?: string
  profile_type?: string
  activeHabitsCount?: number
  currentStreak?: number
  completedToday?: number
  totalAchievements?: number
}

const profile = ref<Profile | null>(null)
const user = ref<any | null>(null)

const activeHabitsCount = ref(0)
const currentStreak = ref(0)
const completedToday = ref(0)
const totalAchievements = ref(0)

const loadUser = () => {
  const stored = localStorage.getItem('user')
  user.value = stored ? JSON.parse(stored) : null
}

const getUserId = (): number | null => {
  const stored = localStorage.getItem('user')
  if (!stored) return null
  try {
    const u = JSON.parse(stored)
    return u?.id ?? u?.user_id ?? null
  } catch {
    return null
  }
}

const loadProfile = () => {
  const storedUser = localStorage.getItem('user')
  if (!storedUser) {
    localStorage.removeItem('profile')
    profile.value = null
    return
  }

  const storedProfile = localStorage.getItem('profile')
  if (storedProfile) {
    profile.value = JSON.parse(storedProfile)
    fetchProfileStats()
  }
}

// ---- Date helpers (local time safe) ----
const formatYMD = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const normalizeYMD = (s: string | undefined | null): string => {
  if (!s) return ''
  return s.slice(0, 10)
}

// ---- Streak helper ----
const computeMaxStreakByHabit = (logsPerHabit: Array<Array<any>>): number => {
  const todayStr = formatYMD(new Date())
  let maxStreak = 0

  for (const logs of logsPerHabit) {
    const dates = new Set<string>(logs.map(l => normalizeYMD(l.log_date)))

    if (!dates.has(todayStr)) continue

    let streak = 0
    const cursor = new Date()
    while (dates.has(formatYMD(cursor))) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }

    if (streak > maxStreak) maxStreak = streak
  }

  return maxStreak
}

// ---- Main stats fetch ----
const fetchProfileStats = async () => {
  if (!profile.value) return

  const userId = getUserId()
  const profileId = profile.value.id
  if (!userId || !profileId) return

  try {
    // 1) Habits
    const habits = (await apiRequest(`/users/${userId}/profiles/${profileId}/habits`)) || []
    const habitsArr: Array<any> = Array.isArray(habits) ? habits : []

    activeHabitsCount.value = habitsArr.length

    // 2) Logs per habit
    const logsPerHabit = await Promise.all(
      habitsArr.map(async (h) => {
        try {
          const logs = (await apiRequest(`/habits/${h.id}/habit_logs`)) || []
          return Array.isArray(logs) ? logs : []
        } catch {
          return []
        }
      })
    )

    const allLogs = logsPerHabit.reduce(
      (acc, logs) => acc.concat(logs),
      [] as Array<any>
      )
    const todayStr = formatYMD(new Date())
    completedToday.value = allLogs.filter(l => normalizeYMD(l.log_date) === todayStr).length

    // 3) Milestones
    let milestonesArr: Array<any> = []
    try {
      const milestones = (await apiRequest(`/users/${userId}/profiles/${profileId}/milestones`)) || []
      milestonesArr = Array.isArray(milestones) ? milestones : []
    } catch {
      milestonesArr = []
    }

    // 4) Total + streak
    totalAchievements.value = allLogs.length + milestonesArr.length
    currentStreak.value = computeMaxStreakByHabit(logsPerHabit)
  } catch (err) {
    console.error('Failed to fetch progress stats', err)
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// ---- Lifecycle + events ----
const handleProfileUpdate = (event: Event) => {
  const customEvent = event as CustomEvent
  if (customEvent.detail) {
    profile.value = customEvent.detail
    fetchProfileStats()
  } else {
    loadProfile()
  }
}

const handleStorageUpdate = () => {
  loadUser()
  loadProfile()
}

onMounted(() => {
  loadUser()
  loadProfile()

  window.addEventListener('profileUpdated', handleProfileUpdate)
  window.addEventListener('storage', handleStorageUpdate)
})

onUnmounted(() => {
  window.removeEventListener('profileUpdated', handleProfileUpdate)
  window.removeEventListener('storage', handleStorageUpdate)
})
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.HomePage-main-section {
  background: var(--main-background-dark);
  min-height: calc(100vh - 4.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  color: var(--text-primary);
  gap: 4rem;
}

/* Hero Section for Guests */
.hero-section {
  max-width: 1200px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 4rem 3rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--box-shadow-default);
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 600;
}

.hero-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  opacity: 0.95;
}

.btn-hero {
  display: inline-block;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 1.2rem 2.5rem;
  border: none;
  border-radius: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 20px rgba(79, 157, 255, 0.4);
  width: fit-content;
}

.btn-hero:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(79, 157, 255, 0.6);
  background: linear-gradient(135deg, #74ebd5, #4f9dff);
}

.hero-features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.features-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  text-align: left;
}

.hero-feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 3px solid #74ebd5;
  transition: all var(--transition-normal);
}

.hero-feature-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.feature-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  border-radius: 50%;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.hero-feature-item span {
  font-size: 1.05rem;
  color: var(--text-primary);
  font-weight: 500;
}

/* Welcome Section */
.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  max-width: 1400px;
  transition: 0.3s ease;
  width: 100%;
}

.welcome-panel {
  width: 100%;
  padding: 3.5rem;
  background: linear-gradient(135deg, rgba(79, 157, 255, 0.15), rgba(116, 235, 213, 0.08));
  border-radius: 28px;
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  position: relative;
  overflow: hidden;
}

.welcome-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(255, 209, 102, 0.2), transparent 45%);
  pointer-events: none;
}

.welcome-identity {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

.profile-welcome-section {
  background: linear-gradient(135deg, rgba(79, 157, 255, 0.18), rgba(116, 235, 213, 0.1));
  border-radius: 18px;
  padding: 1.4rem 1.6rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: 100%;
}

.profile-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-panel-label {
  font-size: 0.75rem;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
}

.profile-panel-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 800px;
}

.profile-panel-note {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.profile-panel-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.profile-panel-pill {
  background: linear-gradient(135deg, var(--accent-yellow), #ff9800);
  color: #0b1f33;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

.profile-panel-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.welcome-avatar {
  width: 84px;
  height: 84px;
  border-radius: 20px;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  display: grid;
  place-items: center;
  box-shadow: 0 10px 25px rgba(79, 157, 255, 0.35);
}

.welcome-initial {
  color: #ffffff;
  font-size: 2.4rem;
  font-weight: 800;
}

.welcome-text {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.welcome-eyebrow {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.welcome-heading {
  font-size: 3.1rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 1.15rem;
  color: var(--text-secondary);
  margin: 0;
}

.welcome-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.btn-ghost {
  display: inline-block;
  padding: 1rem 2.2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  transition: all var(--transition-normal);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.welcome-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.welcome-card {
  background: rgba(0, 0, 0, 0.22);
  border-radius: 16px;
  padding: 1.4rem 1.6rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.welcome-card:hover {
  background: rgba(0, 0, 0, 0.28);
  transform: scale(1.05);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  transition: all var(--transition-normal);
}

.card-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 0.4rem 0;
}

.card-value {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}

.select-profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem 1.8rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.select-profile-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.welcome-second-heading {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.95rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  background: linear-gradient(135deg, #ffd166, #ffb703);
  color: #1c2b3a;
  box-shadow: 0 8px 20px rgba(255, 183, 3, 0.35);
  transition: all var(--transition-normal);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px rgba(255, 183, 3, 0.45);
}

.feature-section {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 0.5rem;
}

.quick-access-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto 1rem;
  padding: 0 0.5rem;
}

.quick-access-header h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Feature Cards Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.feature-card {
  position: relative;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--box-shadow-hover);
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
}

.feature-icon {
  align-self: center;
  font-size: 3rem;
  line-height: 1;
}

.feature-card h3 {
  align-self: center;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  background: var(--heading-gradient);
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.feature-card h4 {
  align-self: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;

}

.feature-card p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
  flex-grow: 1;
}

.arrow {
  font-size: 1.5rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all var(--transition-normal);
}

.feature-card:hover .arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Guest CTA */
.guest-cta {
  text-align: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: var(--radius-large);
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
}

.guest-cta p {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.9rem 2rem;
  border-radius: var(--radius-medium);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
}

.action-button.primary {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
}

.action-button.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(79, 157, 255, 0.5);
}

.action-button.secondary {
  background: linear-gradient(135deg, var(--accent-yellow), #ff9800);
  color: #1e3a5f;
  box-shadow: 0 4px 15px rgba(255, 209, 102, 0.3);
}

.action-button.secondary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 209, 102, 0.5);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2.5rem 2rem;
  }

  .hero-social-proof {
      gap: 1.5rem;
  }
  
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .intro h1 {
    font-size: 2.2rem;
  }

  .hero-title {
    font-size: 2.8rem;
  }

  .welcome-heading {
    font-size: 1.6rem;
  }
}

@media (max-width: 768px) {
  .HomePage-main-section {
    padding: 2rem 1.5rem;
    gap: 2rem;
  }

  .hero-section {
    padding: 2rem 1.5rem;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-description {
    font-size: 0.95rem;
  }

  .hero-social-proof {
    gap: 1rem;
    padding: 1rem;
  }

  .proof-stat {
    font-size: 1.2rem;
  }

  .proof-label {
    font-size: 0.8rem;
  }

  .btn-hero {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .welcome-container {
    flex-direction: column;
    align-items: stretch;
  }

  .intro {
    padding: 2rem 1.5rem;
  }

  .intro h1 {
    font-size: 2rem;
  }

  .intro p {
    font-size: 1rem;
  }

  .welcome-heading {
    font-size: 1.8rem;
  }

  .welcome-subtitle {
    font-size: 1.05rem;
  }

  .welcome-identity {
    flex-direction: column;
    align-items: flex-start;
  }

  .welcome-actions {
    width: 100%;
  }

  .select-profile {
    flex-direction: column;
    align-items: flex-start;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .feature-card {
    padding: 1.5rem;
  }

  .feature-icon {
    font-size: 2.5rem;
  }

  .feature-card h3 {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .HomePage-main-section {
    padding: 1.5rem 1rem;
    gap: 1.5rem;
  }

  .hero-section {
    padding: 1.5rem 1rem;
  }
  
  .features-title {
    font-size: 1.1rem;
  }

  .feature-name {
    font-size: 0.9rem;
  }

  .hero-social-proof {
    flex-direction: column;
    gap: 0.8rem;
    padding: 1rem 0.8rem;
  }

  .proof-item {
    flex-direction: row;
    justify-content: center;
    gap: 0.5rem;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-features {
    gap: 1rem;
  }

  .hero-feature-item {
    padding: 0.8rem;
  }

  .welcome-panel {
    padding: 1.8rem;
  }

  .intro h1 {
    font-size: 1.5rem;
  }

  .feature-icon {
    font-size: 2rem;
  }
}
</style>