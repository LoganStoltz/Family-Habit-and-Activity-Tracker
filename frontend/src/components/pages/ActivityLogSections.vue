<template>
  <div class="activityLogSections">
    <section class="filterSection" :class="{ collapsed: isFilterCollapsed }">
      <close-element @minimize="emit('minimize')" :showCollapse="true" @toggle="handleFilterToggle" />
      <div class="filterSectionHeader">
        <div class="header-left"></div>
        <h1>Filter Habit Logs</h1>
        <div class="header-right"></div>
      </div>
      <div class="filterSectionBody">
        <div class="filterConsole">
          <div class="filterInputs">
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

            <button @click="clearFilters" class="clearButton">Clear Filters</button>
          </div>
        </div>
        <p class="resultsCount">Showing {{ filteredAndSortedLogs.length }} of {{ enrichedLogs.length }} logs</p>
      </div>
    </section>

    <section class="activitySummary" :class="{ collapsed: isTableCollapsed }">
      <close-element @minimize="emit('minimize')" :showCollapse="true" @toggle="handleTableToggle" />
      <div class="habitLogsSectionHeader">
        <div class="header-left">
          <button class="activityButton" @click="fetchData">
            <span class="refresh-logs-label">Refresh Logs</span>
            <span class="refresh-logs-icon" aria-hidden="true">⟳</span>
          </button>
        </div>
        <h1>Habit Logs</h1>
        <div class="header-right">
          <button class="editingModeButton" :class="{ active: showActionsColumn }" @click="showActionsColumn = !showActionsColumn">✏️</button>
        </div>
      </div>
      <div class="activitySummaryBody">
        <p v-if="loading">Loading habit logs...</p>
        <p v-else-if="error" class="error">{{ error }}</p>
        <p v-else-if="enrichedLogs.length === 0">No habit logs found.</p>

        <div v-else class="HabitLogsCards">
              <HabitLogCards
                v-for="log in filteredAndSortedLogs"
                :key="log.id"
                :log="log"
                :showActionsColumn="showActionsColumn"
                :deletingLogId="deletingLogId"
                @confirmDeleteLog="confirmDeleteLog"
                />
        </div>
      </div>
    </section>

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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiRequest } from '../../config/api.js'
import ConfirmDeleteModal from '../Popups/ConfirmDeleteModal.vue'
import HabitLogCards from '../elements/habitLogCards.vue'
import CloseElement from '@/components/elements/closeElement.vue'

const emit = defineEmits(['minimize'])

const user = JSON.parse(localStorage.getItem('user') || '{}')
const profile = JSON.parse(localStorage.getItem('profile') || '{}')
const userId = user?.id
const profileId = profile?.id

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

const fetchHabits = async () => {
  if (!userId || !profileId) {
    throw new Error('User or profile not found. Please log in.')
  }

  const data = await apiRequest(`/users/${userId}/profiles/${profileId}/habits`)
  habits.value = Array.isArray(data) ? data : []
}

const fetchAllLogs = async () => {
  const allLogs = []

  for (const habit of habits.value) {
    try {
      const logs = await apiRequest(`/habits/${habit.id}/habit_logs`)
      const logsArray = Array.isArray(logs) ? logs : []

      logsArray.forEach((log) => {
        log.habit_id = habit.id
      })

      allLogs.push(...logsArray)
    } catch (err) {
      console.error(`Error fetching logs for habit ${habit.id}:`, err)
    }
  }

  habitLogs.value = allLogs
}

const habitLogCounts = computed(() => {
  return habitLogs.value.reduce((accumulator, log) => {
    const habitId = log.habit_id
    if (!habitId) return accumulator

    accumulator[habitId] = (accumulator[habitId] || 0) + 1
    return accumulator
  }, {})
})

const habitLogOrdinals = computed(() => {
  const grouped = habitLogs.value.reduce((accumulator, log) => {
    const habitId = log.habit_id
    if (!habitId) return accumulator

    if (!accumulator[habitId]) accumulator[habitId] = []
    accumulator[habitId].push(log)
    return accumulator
  }, {})

  const ordinalMap = {}

  Object.values(grouped).forEach((logsForHabit) => {
    logsForHabit
      .slice()
      .sort((a, b) => {
        const dateDiff = new Date(a.created_at) - new Date(b.created_at)
        if (dateDiff !== 0) return dateDiff
        return (a.id || 0) - (b.id || 0)
      })
      .forEach((log, index) => {
        ordinalMap[log.id] = index + 1
      })
  })

  return ordinalMap
})

const enrichedLogs = computed(() => {
  return habitLogs.value
    .map((log) => {
      const habit = habits.value.find((h) => h.id === log.habit_id)

      return {
        ...log,
        habitName: habit?.name || 'Unknown Habit',
        category: habit?.category || 'N/A',
        habitLogCount: habitLogCounts.value[log.habit_id] || 0,
        habitLogOrdinal: habitLogOrdinals.value[log.id] || 0,
      }
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const availableCategories = computed(() => {
  const categoriesSet = new Set(
    habits.value
      .map((h) => h.category)
      .filter((cat) => cat && cat !== 'N/A')
  )
  return Array.from(categoriesSet).sort()
})

const filteredLogs = computed(() => {
  let logs = enrichedLogs.value

  if (searchLogId.value.trim()) {
    const search = searchLogId.value.toLowerCase().trim()
    logs = logs.filter((log) => log.id?.toString().toLowerCase().includes(search))
  }

  if (searchName.value.trim()) {
    const search = searchName.value.toLowerCase().trim()
    logs = logs.filter((log) => (log.habitName || '').toLowerCase().includes(search))
  }

  if (selectedCategory.value) {
    logs = logs.filter((log) => log.category === selectedCategory.value)
  }

  if (selectedDate.value) {
    const now = new Date()
    const cutoff = new Date(now)

    switch (selectedDate.value) {
      case '1_week':
        cutoff.setDate(now.getDate() - 7)
        break
      case '1_month':
        cutoff.setDate(now.getDate() - 30)
        break
      case '3_months':
        cutoff.setMonth(now.getMonth() - 3)
        break
      case '6_months':
        cutoff.setMonth(now.getMonth() - 6)
        break
      case '1_year':
        cutoff.setFullYear(now.getFullYear() - 1)
        break
      default:
        break
    }

    logs = logs.filter((log) => new Date(log.created_at) >= cutoff)
  }

  return logs
})

const filteredAndSortedLogs = computed(() => {
  const logs = [...filteredLogs.value]

  logs.sort((a, b) => {
    let aVal = a[sortColumn.value]
    let bVal = b[sortColumn.value]

    if (sortColumn.value === 'created_at') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }

    if (aVal == null) return 1
    if (bVal == null) return -1

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
  searchLogId.value = ''
}

const confirmDeleteLog = (log) => {
  logToDelete.value = log
  showConfirmDeleteModal.value = true
}

const cancelDeleteLog = () => {
  logToDelete.value = null
  showConfirmDeleteModal.value = false
}

const deleteLog = async () => {
  if (!logToDelete.value) return

  const log = logToDelete.value
  deletingLogId.value = log.id

  try {
    await apiRequest(`/habits/${log.habit_id}/habit_logs/${log.id}`, { method: 'DELETE' })

    await fetchData()

    showConfirmDeleteModal.value = false
    logToDelete.value = null
  } catch (err) {
    console.error('Error deleting log:', err)
    error.value = err?.message || 'Failed to delete log. Please try again.'
  } finally {
    deletingLogId.value = null
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = ''

  try {
    await fetchHabits()
    await fetchAllLogs()
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatExtraData = (extraData) => {
  if (!extraData || (typeof extraData === 'object' && Object.keys(extraData).length === 0)) {
    return 'N/A'
  }

  if (typeof extraData === 'string') return extraData

  try {
    return JSON.stringify(extraData)
  } catch {
    return 'N/A'
  }
}

const handleFilterToggle = (collapsed) => {
  isFilterCollapsed.value = collapsed
}

const handleTableToggle = (collapsed) => {
  isTableCollapsed.value = collapsed
}

onMounted(fetchData)
</script>

<style scoped>
.activityLogSections {
  max-width: 1600px;
  margin: 20px auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.filterSection,
.activitySummary {
  margin: 20px 0;
  padding: 0;
  box-sizing: border-box;
}

.refresh-logs-icon {
  display: none;
}

.filterSectionHeader,
.habitLogsSectionHeader {
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

.filterSectionHeader h1,
.habitLogsSectionHeader h1 {
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

.filterSection.collapsed .filterSectionHeader,
.activitySummary.collapsed .habitLogsSectionHeader {
  margin: 0px -20px 0 -20px;
  border-radius: 12px;
}

.filterSection :deep(.button-group),
.activitySummary :deep(.button-group) {
  top: 0px;
  left: 0px;
  right: auto;
  height: 30px;
  z-index: 0;
}

.filterSection,
.activitySummary {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.filterSection.collapsed,
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

.HabitLogsCards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

@media (max-width: 1400px) {
  .HabitLogsCards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1050px) {
  .HabitLogsCards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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
  color: #ffffff;
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

@media (max-width: 720px) {
  .filterSection,
  .activitySummary {
    padding: 16px;
  }

  .filterSectionHeader,
  .habitLogsSectionHeader {
    padding: 12px 14px;
    margin: -16px -16px 16px -16px;
  }

  .filterSectionHeader h1,
  .habitLogsSectionHeader h1 {
    font-size: 1.25rem;
  }

  .header-left,
  .header-right {
    width: auto;
    min-height: 0;
  }

  .filterConsole {
    padding: 0 10px 12px 10px;
  }

  .filterInputs {
    grid-template-columns: 1fr;
  }

  .clearButton {
    width: 100%;
    align-self: stretch;
    transform: none;
  }

  .resultsCount {
    font-size: 0.85rem;
  }

  .HabitLogsCards {
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }

  .activitySummaryBody {
    overflow-x: auto;
  }

  .habits-table {
    font-size: 0.85rem;
    min-width: 640px;
  }

  .habits-table th,
  .habits-table td {
    padding: 8px 10px;
  }
}

@media (max-width: 1000px) {
  .habitLogsSectionHeader {
    gap: 0.5rem;
    padding: 12px 14px;
  }

  .habitLogsSectionHeader h1 {
    font-size: 1.5rem;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 0.35rem;
  }

  .habitLogsSectionHeader .header-left,
  .habitLogsSectionHeader .header-right {
    width: 56px;
    min-height: 40px;
    flex: 0 0 56px;
  }

  .habitLogsSectionHeader .activityButton {
    width: 50px;
    height: 50px;
    min-width: 40px;
    min-height: 40px;
    padding: 0;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .habitLogsSectionHeader .refresh-logs-label {
    display: none;
  }

  .habitLogsSectionHeader .refresh-logs-icon {
    display: inline-block;
    line-height: 1;
    font-size: 1.5rem;
    font-weight: 700;
  }
}

@media (max-width: 720px) {
  .habitLogsSectionHeader h1 {
    font-size: 1.3rem;
  }

  .habitLogsSectionHeader .header-left,
  .habitLogsSectionHeader .header-right {
    width: 50px;
    flex: 0 0 50px;
  }
}
</style>
