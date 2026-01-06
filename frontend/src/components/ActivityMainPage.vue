<template>
  <div class="activityMainPage">
    <h1>Activity Main Page</h1>
    <!-- Content for the Activity Main Page goes here -->
    <div class="activityContent">
      <section class="activityButtonsPanel">
        <button class="activityButton" @click="fetchData">Refresh Activity History</button>
        <router-link to="/habits" class="activityButton">View Habits</router-link>
        <router-link v-if="profile.profile_type === 'Baby'" class="dashboardButton logBaby" to="/baby-milestones">
          Log Baby Milestones
        </router-link>
      </section>

        <!-- Search/Filter Section -->
      <section class="filterSection">
          <div class="filterInputs">
              <div class="filterGroup">
                  <label for="searchName">Search Habit Name:</label>
                  <input 
                      id="searchName"
                      v-model="searchName" 
                      type="text" 
                      placeholder="Enter habit name..."
                      class="filterInput"
                  />
              </div>
              
              <div class="filterGroup">
                  <label for="filterCategory">Filter by Category:</label>
                  <select 
                      id="filterCategory"
                      v-model="selectedCategory" 
                      class="filterSelect"
                  >
                      <option value="">All Categories</option>
                      <option v-for="category in availableCategories" :key="category" :value="category">
                          {{ category }}
                      </option>
                  </select>
              </div>
              
              <button @click="clearFilters" class="clearButton">Clear Filters</button>
          </div>
          <p class="resultsCount">Showing {{ filteredAndSortedLogs.length }} of {{ enrichedLogs.length }} logs</p>
      </section>

      <section class="activitySummary">
            <h2>Habit Logs Table</h2>
            
            
            <!-- Loading state -->
            <p v-if="loading">Loading habit logs...</p>
            
            <!-- Error state -->
            <p v-else-if="error" class="error">{{ error }}</p>
            
            <!-- Empty state -->
            <p v-else-if="enrichedLogs.length === 0">No habit logs found.</p>
            
            <!-- Table -->
            <table v-else class="habits-table">
                <thead>
                    <tr>
                        <th @click="sortBy('id')" class="sortable">
                          Log ID
                          <span class="sort-icon">{{ getSortIcon('id') }}</span>
                        </th>
                        <th @click="sortBy('habitName')" class="sortable">
                          Habit Name
                          <span class="sort-icon">{{ getSortIcon('habitName') }}</span>
                        </th>
                        <th @click="sortBy('category')" class="sortable">
                          Category
                          <span class="sort-icon">{{ getSortIcon('category') }}</span>
                        </th>
                        <th @click="sortBy('created_at')" class="sortable">
                          Logged At
                          <span class="sort-icon">{{ getSortIcon('created_at') }}</span>
                        </th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="log in filteredAndSortedLogs" :key="log.id">
                        <td>{{ log.id }}</td>
                        <td>{{ log.habitName }}</td>
                        <td>{{ log.category || 'N/A' }}</td>
                        <td>{{ formatDate(log.created_at) }}</td>
                        <td>{{ log.notes || 'N/A' }}</td>
                    </tr>
                </tbody>
            </table>
      </section>
    </div>
  </div>
    
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { apiRequest } from '@/config/api'

// Get user and profile from LocalStorage
const user = JSON.parse(localStorage.getItem('user') || '{}')
const profile = JSON.parse(localStorage.getItem('profile') || '{}')
const userId = user?.id
const profileId = profile?.id

// Reactive state
const habits = ref([])
const habitLogs = ref([])
const loading = ref(false)
const error = ref('')
const sortColumn = ref('created_at')
const sortDirection = ref('desc')
const searchName = ref('')
const selectedCategory = ref('')

// Fetch all habits for the profile
const fetchHabits = async () => {
  if (!userId || !profileId) {
    error.value = 'User or profile not found. Please log in.'
    return
  }
  
  try {
    const response = await apiRequest(`/users/${userId}/profiles/${profileId}/habits`)
    if (!response.ok) {
      throw new Error(`Failed to fetch habits: ${response.status}`)
    }
    const data = await response.json()
    habits.value = data
  } catch (err) {
    console.error('Error fetching habits:', err)
    throw err
  }
}

// Fetch logs for all habits
const fetchAllLogs = async () => {
  const allLogs = []
  
  for (const habit of habits.value) {
    try {
      const response = await fetch(`http://localhost:3000/habits/${habit.id}/habit_logs`)
      if (response.ok) {
        const logs = await response.json()
        // Add habit_id to each log for joining
        logs.forEach(log => {
          log.habit_id = habit.id
        })
        allLogs.push(...logs)
      }
    } catch (err) {
      console.error(`Error fetching logs for habit ${habit.id}:`, err)
    }
  }
  
  habitLogs.value = allLogs
}

// Computed property to join logs with habit names
const enrichedLogs = computed(() => {
  return habitLogs.value.map(log => {
    const habit = habits.value.find(h => h.id === log.habit_id)
    return {
      ...log,
      habitName: habit?.name || 'Unknown Habit',
      category: habit?.category || 'N/A'
    }
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Most recent first
})

const availableCategories = computed(() => {
  const categoriesSet = new Set(
    habits.value
      .map(log => log.category)
      .filter(cat => cat && cat !== 'N/A')
  )
  return Array.from(categoriesSet).sort()
})

// Filter logs based on search criteria
const filteredLogs = computed(() => {
  let logs = enrichedLogs.value
  
  // Filter by habit name
  if (searchName.value.trim()) {
    const search = searchName.value.toLowerCase().trim()
    logs = logs.filter(log => 
      log.habitName.toLowerCase().includes(search)
    )
  }

  // Filter by category
  if (selectedCategory.value) {
    logs = logs.filter(log => log.category === selectedCategory.value)
  }

  return logs
})

// Apply sorting to filtered logs
const filteredAndSortedLogs = computed(() => {
  const logs = [...filteredLogs.value]

  logs.sort((a, b) => {
    let aVal = a[sortColumn.value]
    let bVal = b[sortColumn.value]

    // Handle date sorting
    if (sortColumn.value === 'created_at') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }
    
    // Handle null/undefined values
    if (aVal == null) return 1
    if (bVal == null) return -1
    
    // String comparison (case-insensitive)
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })

  return logs
})

const clearFilters = () => {
  searchName.value = ''
  selectedCategory.value = ''
}

// Sort by column
const sortBy = (column) => {
  if (sortColumn.value === column) {
    // Toggle direction if same column
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // New column, default to ascending
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

// Get sort icon for column
const getSortIcon = (column) => {
  if (sortColumn.value !== column) return '⇅'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

// Fetch all data
const fetchData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await fetchHabits()
    await fetchAllLogs()
  } catch (err) {
    error.value = err.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
}

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
// Fetch on component mount
onMounted(fetchData)
</script>

<style scoped>
.activityMainPage {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
}

.activityButtonsPanel {
    margin-bottom: 20px;
}

.activityButton {
    margin-right: 10px;
    padding: 10px 15px;
    font-size: 16px;
    cursor: pointer;
    background: linear-gradient(135deg, #4f9dff, #74ebd5);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s;
    text-decoration: none;
}

.activityButton:hover {
    filter: brightness(1.1);
    box-shadow: 0 4px 12px rgba(79, 157, 255, 0.3);
}

.activitySummary {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.activitySummary h2 {
    margin-top: 0;
    color: #333;
    font-size: 1.5rem;
    margin-bottom: 1rem;
}
.activitySummary p {
    text-align: center;
    margin-top: 0;
    color: #333;
    font-size: 1.2rem;
}

.error {
    color: #d32f2f;
    font-weight: 600;
}

/* Table Styles */
.habits-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.habits-table thead {
    background: linear-gradient(135deg, #4f9dff, #74ebd5);
    color: white;
}

.habits-table th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.5px;
}

.habits-table tbody tr {
    border-bottom: 1px solid #e0e7ef;
    transition: background 0.2s;
}

.habits-table tbody tr:hover {
    background: #f0f7ff;
}

.habits-table tbody tr:last-child {
    border-bottom: none;
}

.habits-table td {
    padding: 12px 16px;
    color: #555;
    font-size: 0.95rem;
}

.habits-table td:first-child {
    font-weight: 600;
    color: #4f9dff;
}

.sortable {
    cursor: pointer;
    user-select: none;
    position: relative;
    transition: background 0.2s;
}

.sortable:hover {
    background: rgba(255, 255, 255, 0.1);
}

.sort-icon {
    margin-left: 6px;
    font-size: 0.9rem;
    opacity: 0.7;
}

.filterSection {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    margin-bottom: 20px;
}

.filterInputs {
    display: flex;
    gap: 15px;
    align-items: flex-end;
    flex-wrap: wrap;
}

.filterGroup {
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
}

.filterGroup label {
    margin-bottom: 6px;
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
}

.filterInput,
.filterSelect {
    padding: 10px 12px;
    border: 2px solid #e0e7ef;
    border-radius: 12px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.filterInput:focus,
.filterSelect:focus {
    outline: none;
    border-color: #4f9dff;
}

.clearButton {
  padding: 10px 20px;
  background: white;
  color: #ff0000;
  border: 1.4px solid #c90d0080;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 1000;
  transition: all 0.2s;
  align-self: flex-end;
  transform: translate(0px, -1px);
}

.clearButton:hover {
    background: #ff004017;
    border: 1.4px solid #49070279;
    box-shadow: 0 2px 6px rgba(244, 67, 54, 0.39);
}

.resultsCount {
    margin-top: 15px;
    color: #666;
    font-size: 0.95rem;
    text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
    .habits-table {
        font-size: 0.85rem;
    }
    
    .habits-table th,
    .habits-table td {
        padding: 8px 10px;
    }
}
</style>