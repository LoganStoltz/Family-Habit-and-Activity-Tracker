<template>
  <div class="activityMainPage">
    <!-- <h1>Activity Main Page</h1> -->
    <!-- Content for the Activity Main Page goes here -->
    <div class="activityContent">

      
      <!-- Search/Filter Section -->
      <section class="filterSection activitySection" :class="{ collapsed: isFilterCollapsed }">
        <close-element @minimize="$emit('minimize')" :showCollapse="true" @toggle="handleFilterToggle" />
        <div class="filterSectionHeader">
          <div class="header-left"></div>
          <h1>Filter Habit Logs</h1>
          <div class="header-right"></div>
        </div>
        <div class="filterSectionBody">
          <div class="filterConsole">
            <div class="filterInputs">
              <div class="filterGroup">
                <label for="searchLogId">Log ID:</label>
                <input 
                    id="searchLogId"
                    v-model="searchLogId" 
                    type="text" 
                    placeholder="Search by Log ID..."
                    class="filterInput"
                />
              </div>  

              <div class="filterGroup">
                <label for="searchName">Habit Name:</label>
                <input 
                    id="searchName"
                    v-model="searchName" 
                    type="text" 
                    placeholder="Search by Habit Name..."
                    class="filterInput"
                />
              </div>
              
              <div class="filterGroup">
                <label for="filterCategory">Category:</label>
                <select 
                    id="filterCategory"
                    v-model="selectedCategory" 
                    class="filterSelect"
                    :class="{ 'placeholder-active': !selectedCategory }"
                >
                  <option value="" disabled selected hidden>Search by Category...</option>
                  <option v-for="category in availableCategories" :key="category" :value="category">
                      {{ category }}
                  </option>
                </select>
              </div>

              <div class="filterGroup">
                <label for="filterDate">Time range</label>
                <select 
                    id="filterDate"
                    v-model="selectedDate" 
                    class="filterSelect"
                    :class="{ 'placeholder-active': !selectedDate }"
                >
                  <option value="" disabled selected hidden>Search by Date Range...</option>
                  <option value="1_week"> Last 7 days</option>
                  <option value="1_month"> Last 30 days</option>
                  <option value="3_months"> Last 3 months</option>
                  <option value="6_months"> Last 6 months</option>
                  <option value="1_year"> Last year</option>
                </select>
              </div>

                <button @click="clearFilters" class="clearButton">Clear Filters</button>
            </div>
          </div>
          <p class="resultsCount">Showing {{ filteredAndSortedLogs.length }} of {{ enrichedLogs.length }} logs</p>
        </div>
      </section>
      <!-- Habit Logs Table Section -->
      <section class="activitySummary activitySection" :class="{ collapsed: isTableCollapsed }">
        <close-element @minimize="$emit('minimize')" :showCollapse="true" @toggle="handleTableToggle" />
        <div class="habit-logs-table-header">
          <div class="header-left">
            <button class="activityButton" @click="fetchData">Refresh Logs</button>
          </div>
          <h1>Habit Logs Table</h1>
          <div class="header-right">
            <button class="editingModeButton" :class="{ active: showActionsColumn }" @click="showActionsColumn = !showActionsColumn">✏️</button>
          </div>
        </div>
        <div class="activitySummaryBody">
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
                      <th v-if="showActionsColumn">Actions</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="log in filteredAndSortedLogs" :key="log.id">
                      <td>{{ log.id }}</td>
                      <td>{{ log.habitName }}</td>
                      <td>{{ log.category || 'N/A' }}</td>
                      <td>{{ formatDate(log.created_at) }}</td>
                      <td>{{ log.notes || 'N/A' }}</td>
                      <td v-if="showActionsColumn">
                        <button 
                          class="delete-log-btn" 
                          @click="confirmDeleteLog(log)"
                          :disabled="deletingLogId === log.id"
                        >
                          {{ deletingLogId === log.id ? 'Deleting...' : '🗑️ Delete' }}
                        </button>
                      </td>
                  </tr>
              </tbody>
          </table>
        </div>
      </section>
      <!-- Habits Page Component Section -->
      <section class="activitySection" :class="{ collapsed: isHabitsCollapsed }">
        <HabitsPage ref="habitsPageRef" @toggle="handleHabitsToggle" />
      </section>

      <!-- Confirm Delete Modal -->
      <ConfirmDeleteModal
        v-if="showConfirmDeleteModal"
        :title="'Delete Log?'"
        :message="`Are you sure you want to delete log <strong>#${logToDelete?.id}</strong> for <strong>${logToDelete?.habitName}</strong>?`"
        :warning="'This action cannot be undone!'"
        :loading="deletingLogId === logToDelete?.id"
        :confirmText="'Yes, Delete'"
        :cancelText="'Cancel'"
        :loadingText="'Deleting...'"
        @confirm="deleteLog"
        @cancel="cancelDeleteLog"
      />
    </div>
  </div>
    
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { apiRequest } from '@/config/api'
import HabitsPage from '../pages/HabitsPage.vue';
import ConfirmDeleteModal from '../Popups/ConfirmDeleteModal.vue';
import CloseElement from '@/components/elements/closeElement.vue';

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
const searchLogId = ref('')
const searchName = ref('')
const selectedCategory = ref('')
const selectedDate = ref('')
const deletingLogId = ref(null)
const showActionsColumn = ref(false)
const showConfirmDeleteModal = ref(false)
const logToDelete = ref(null)
const isFilterCollapsed = ref(false)
const isTableCollapsed = ref(false)
const isHabitsCollapsed = ref(false)
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

  if (searchLogId.value.trim()) {
    const search = searchLogId.value.toLowerCase().trim()
    logs = logs.filter(log => 
      log.id.toString().toLowerCase().includes(search)
    )
  }
  
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

  if (selectedDate.value) {
    const [startDate, endDate] = selectedDate.value.split(' - ')
    logs = logs.filter(log => {
      const logDate = new Date(log.created_at)
      return logDate >= new Date(startDate) && logDate <= new Date(endDate)
    })
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
  selectedDate.value = ''
}

// Show confirmation modal for delete
const confirmDeleteLog = (log) => {
  logToDelete.value = log
  showConfirmDeleteModal.value = true
}

// Cancel delete
const cancelDeleteLog = () => {
  logToDelete.value = null
  showConfirmDeleteModal.value = false
}

// Delete a log
const deleteLog = async () => {
  if (!logToDelete.value) return

  const log = logToDelete.value
  deletingLogId.value = log.id

  try {
    const response = await apiRequest(
      `/habits/${log.habit_id}/habit_logs/${log.id}`,
      { method: 'DELETE' }
    )

    if (!response.ok) {
      throw new Error(`Failed to delete log: ${response.status}`)
    }

    // Refresh logs after deletion
    await fetchData()
    
    // Close modal
    showConfirmDeleteModal.value = false
    logToDelete.value = null
  } catch (err) {
    console.error('Error deleting log:', err)
    error.value = 'Failed to delete log. Please try again.'
  } finally {
    deletingLogId.value = null
  }
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

// Handle collapse/expand toggle for filter section
const handleFilterToggle = (collapsed) => {
  isFilterCollapsed.value = collapsed
}

// Handle collapse/expand toggle for table section
const handleTableToggle = (collapsed) => {
  isTableCollapsed.value = collapsed
}

// Handle collapse/expand toggle for habits section
const handleHabitsToggle = (collapsed) => {
  isHabitsCollapsed.value = collapsed
}

// Fetch on component mount
onMounted(fetchData)
</script>

<style scoped>
.activityMainPage {
    max-width: 1600px;
    margin: 0 auto;
}

.activitySection {
    margin: 20px 0;
    position: relative;
}

.activitySection.collapsed {
    margin: 15px 0;
}

/* ========== SECTION HEADER STYLES ========== */
/* Common header styling for all sections */
.filterSectionHeader,
.habit-logs-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  padding: 15px 20px;
  border-radius: 12px 12px 0 0;
  margin: -20px -20px 20px -20px;
  color: white;
  height: 74px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

/* Header titles */
.filterSectionHeader h1,
.habit-logs-table-header h1 {
  font-size: 1.5rem;
  margin: 0;
  color: white;
  font-weight: 700;
  text-align: center;
  flex: 1;
}

/* Header button containers */
.header-left,
.header-right {
  width: 180px;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.header-left {
  justify-content: flex-start;
}

.header-right {
  justify-content: flex-end;
}

/* Collapsed header states */
.filterSection.collapsed .filterSectionHeader,
.activitySummary.collapsed .habit-logs-table-header {
  margin: -10px -20px 0 -20px;
  border-radius: 12px;
}

/* Position collapse buttons on left side of headers, vertically centered */
.activitySection :deep(.button-group) {
  top: 0px;
  left: -3px;
  right: auto;
  height: 30px;
  z-index: 0;
}
/* ========== END SECTION HEADER STYLES ========== */

.activityButton {
  background: rgba(255, 255, 255, 0.95);
  color: #4f9dff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-weight: 700;
  font-size: 1.08rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
}

.activityButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 157, 255, 0.35);
    filter: brightness(1.08);
}

.activityButton:active {
    transform: translateY(0px);
    box-shadow: 0 2px 8px rgba(79, 157, 255, 0.18);
}

.activitySummary {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    position: relative;
    transition: all 0.3s ease;
}

.activitySummary.collapsed {
  padding: 0px 20px 20px 20px;
  box-shadow: none;
}

.activitySummaryBody {
  transition: all 0.3s ease;
}

.activitySummary.collapsed .activitySummaryBody {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  margin: 0;
  padding: 0;
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

.editingModeButton {
  font-size: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 0.7rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
}

.editingModeButton:hover {
  background: rgba(0, 0, 0, 0.2);
}

.editingModeButton.active {
  background: rgba(0, 0, 0, 0.3);
}

.editingModeButton.active:hover {
  background: rgba(0, 0, 0, 0.2);
}

.error {
    color: #d32f2f;
    font-weight: 600;
}

.label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 700;
  color: #41506a;
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

.delete-log-btn {
    padding: 6px 12px;
    background: linear-gradient(135deg, #f43f5e, #e11d48);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(244, 63, 94, 0.2);
}

.delete-log-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(244, 63, 94, 0.3);
}

.delete-log-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 700;
  color: #41506a;
}

.filterSection {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  position: relative;
  transition: all 0.3s ease;
}

.filterSection.collapsed {
  padding: 0 20px 20px 20px;
  box-shadow: none;
}

.filterSectionBody {
  transition: all 0.3s ease;
}

.filterSection.collapsed .filterSectionBody {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  margin: 0;
  padding: 0;
}

.filterSectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  padding: 15px 20px;
  border-radius: 12px 12px 0 0;
  margin: -20px -20px 20px -20px;
  color: white;
}

.filterSectionHeader h1 {
  font-size: 1.5rem;
  margin: 0;
  color: white;
  font-weight: 700;
  text-align: center;
  flex: 1;
}

.header-left,
.header-right {
  width: 180px;
  display: flex;
  align-items: center;
}

.header-left {
  justify-content: flex-start;
}

.header-right {
  justify-content: flex-end;
}

.filterSection.collapsed .filterSectionHeader {
  margin: -10px -20px 0 -20px;
  border-radius: 12px;
}

.filterConsole {
  padding: 0 20px 20px 20px;
  transition: all 0.3s ease;
}

.filterInputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.9rem;
  align-items: end;
}

.filterGroup {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 700;
  color: #41506a;
}

.filterGroup label {
  font-weight: 700;
  color: #41506a;
}

.filterInput,
.filterSelect {
  border: 1.5px solid #d4deef;
  border-radius: 12px;
  padding: 0.75rem 0.85rem;
  font-size: 1rem;
  background: #f8fbff;
  transition: border 0.2s, box-shadow 0.2s;
  color: #333;
}

.filterInput::placeholder {
  color: #aaa;
}

.filterSelect.placeholder-active {
  color: #aaa;
}

.filterSelect option {
  color: #333;
}

.filterInput:focus,
.filterSelect:focus {
  outline: none;
  border-color: #4f9dff;
  box-shadow: 0 0 0 3px rgba(79, 157, 255, 0.12);
}

.clearButton {
  padding: 13px 20px;
  background: white;
  color: #f44336;
  border: 1.4px solid #f4433680;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 1000;
  transition: all 0.2s;
  align-self: flex-end;
}

.clearButton:hover {
    border: 0;
    color: white;
}

.resultsCount {
    margin-top: 15px;
    color: #666;
    font-size: 0.95rem;
    text-align: center;
    transition: all 0.3s ease;
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