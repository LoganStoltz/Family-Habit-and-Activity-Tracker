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
        <div class="header-right header-actions">
          <span class="selectedCount">Selected: {{ selectedLogIds.length }}</span>
          <button
            class="editingModeButton viewModeButton"
            :class="{ active: viewMode === 'table' }"
            @click="toggleViewMode"
            :title="viewMode === 'table' ? 'Switch to card view' : 'Switch to table view'"
          >
            {{ viewMode === 'table' ? '🧩' : '📋' }}
          </button>
          <button class="editingModeButton" :class="{ active: showActionsColumn }" @click="showActionsColumn = !showActionsColumn">✏️</button>
        </div>
      </div>
      <div class="activitySummaryBody">
        <p v-if="loading">Loading habit logs...</p>
        <p v-else-if="error" class="error">{{ error }}</p>
        <p v-else-if="enrichedLogs.length === 0">No habit logs found.</p>

        <div v-else-if="viewMode === 'cards'" class="HabitLogsCards">
              <HabitLogCards
                v-for="log in filteredAndSortedLogs"
                :key="log.id"
                :log="log"
                :selectionEnabled="true"
                :isSelected="isLogSelected(log.id)"
                :showActionsColumn="showActionsColumn"
                :deletingLogId="deletingLogId"
                @toggle-log-selection="toggleLogSelection"
                @editHabitLog="openEditLogModal"
                @editHabit="openEditLogModal"
                @confirmDeleteLog="confirmDeleteLog"
                />
        </div>

        <div v-else class="tableWrap">
          <table class="habits-table">
            <thead>
              <tr>
                <th class="selectColumn">
                  <input
                    type="checkbox"
                    :checked="allVisibleSelected"
                    :disabled="!filteredAndSortedLogs.length"
                    @change="toggleSelectAllVisible"
                    aria-label="Select all visible habit logs"
                  />
                </th>
                <th>Log #</th>
                <th>Habit</th>
                <th>Category</th>
                <th>Logged At</th>
                <th>Notes</th>
                <th>Details</th>
                <th v-if="showActionsColumn">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in filteredAndSortedLogs" :key="`table-${log.id}`" :class="{ selectedRow: isLogSelected(log.id) }">
                <td class="selectColumn">
                  <input
                    type="checkbox"
                    :checked="isLogSelected(log.id)"
                    @change="toggleLogSelection(log.id)"
                    :aria-label="`Select log ${getStableLogNumber(log)}`"
                  />
                </td>
                <td>{{ getStableLogNumber(log) }}</td>
                <td>{{ log.habitName || 'Unknown Habit' }}</td>
                <td>{{ log.category || 'N/A' }}</td>
                <td>{{ formatDate(log.created_at || log.updated_at) }}</td>
                <td class="tableNotes">{{ log.notes || 'N/A' }}</td>
                <td class="tableDetails">
                  <ul v-if="getExtraDataEntries(log.extra_data).length" class="tableDetailsList">
                    <li
                      v-for="entry in getExtraDataEntries(log.extra_data)"
                      :key="`${log.id}-${entry.key}`"
                      class="tableDetailsItem"
                    >
                      <span class="tableDetailsKey">{{ entry.label }}:</span>
                      <span class="tableDetailsValue">{{ entry.value }}</span>
                    </li>
                  </ul>
                  <span v-else>N/A</span>
                </td>
                <td v-if="showActionsColumn" class="tableActions">
                  <button class="tableActionBtn edit" @click="openEditLogModal(log)">Edit</button>
                  <button
                    class="tableActionBtn delete"
                    @click="confirmDeleteLog(log)"
                    :disabled="deletingLogId === log.id"
                  >
                    {{ deletingLogId === log.id ? 'Deleting...' : 'Delete' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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

    <EditHabitLogModal
      v-if="showEditLogModal"
      :log="logToEdit"
      @save="handleLogUpdated"
      @close="closeEditLogModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiRequest } from '../../config/api.js'
import ConfirmDeleteModal from '../Popups/ConfirmDeleteModal.vue'
import EditHabitLogModal from '../Popups/EditHabitLogModal.vue'
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
const viewMode = ref('cards')
const showEditLogModal = ref(false)
const logToEdit = ref(null)
const isFilterCollapsed = ref(false)
const isTableCollapsed = ref(false)
const selectedLogIds = ref([])

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'cards' ? 'table' : 'cards'
}

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

const sortedFilteredLogs = computed(() => {
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

const stableLogNumberMap = computed(() => {
  return sortedFilteredLogs.value.reduce((accumulator, log, index) => {
    accumulator[log.id] = index
    return accumulator
  }, {})
})

const getStableLogNumber = (log) => {
  return stableLogNumberMap.value[log?.id] ?? 'N/A'
}

const filteredAndSortedLogs = computed(() => {
  const logs = [...sortedFilteredLogs.value]

  if (!searchLogId.value.trim()) return logs

  const search = searchLogId.value.toLowerCase().trim()
  return logs.filter((log) => String(getStableLogNumber(log)).toLowerCase().includes(search))
})

const allVisibleSelected = computed(() => {
  if (!filteredAndSortedLogs.value.length) return false
  return filteredAndSortedLogs.value.every((log) => selectedLogIds.value.includes(log.id))
})

const isLogSelected = (logId) => selectedLogIds.value.includes(logId)

const toggleLogSelection = (logId) => {
  if (isLogSelected(logId)) {
    selectedLogIds.value = selectedLogIds.value.filter((id) => id !== logId)
    return
  }

  selectedLogIds.value = [...selectedLogIds.value, logId]
}

const toggleSelectAllVisible = () => {
  const visibleIds = filteredAndSortedLogs.value.map((log) => log.id)
  if (!visibleIds.length) return

  if (allVisibleSelected.value) {
    selectedLogIds.value = selectedLogIds.value.filter((id) => !visibleIds.includes(id))
    return
  }

  selectedLogIds.value = Array.from(new Set([...selectedLogIds.value, ...visibleIds]))
}

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

const openEditLogModal = (log) => {
  logToEdit.value = log
  showEditLogModal.value = true
}

const closeEditLogModal = () => {
  logToEdit.value = null
  showEditLogModal.value = false
}

const handleLogUpdated = async () => {
  await fetchData()
  closeEditLogModal()
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
    selectedLogIds.value = []
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

const toDisplayLabel = (key) => {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())
}

const formatDetailValue = (value) => {
  if (value == null || value === '') return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'N/A'
  if (typeof value === 'object') return formatExtraData(value)
  return String(value)
}

const parseExtraDataObject = (extraData) => {
  if (!extraData) return null

  if (typeof extraData === 'object' && !Array.isArray(extraData)) {
    return extraData
  }

  if (typeof extraData === 'string') {
    try {
      const parsed = JSON.parse(extraData)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      return null
    }
  }

  return null
}

const getExtraDataEntries = (extraData) => {
  const objectData = parseExtraDataObject(extraData)
  if (!objectData) return []

  return Object.keys(objectData)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
      key,
      label: toDisplayLabel(key),
      value: formatDetailValue(objectData[key]),
    }))
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

.selectedCount {
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
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

.header-actions {
  gap: 0.5rem;
  justify-content: flex-end;
}

.viewModeButton {
  min-width: 55px;
  min-height: 55px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 1;
}

.tableWrap {
  width: 100%;
  overflow-x: auto;
  margin-top: 0.5rem;
  border-radius: 12px;
  border: 1px solid rgba(154, 187, 224, 0.58);
  box-shadow: 0 10px 24px rgba(5, 12, 26, 0.22);
  background: rgba(26, 48, 70, 0.46);
}

.habits-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
  background: transparent;
}

.habits-table th,
.habits-table td {
  border-bottom: 1px solid rgba(154, 187, 224, 0.36);
  padding: 13px 14px;
  text-align: left;
  vertical-align: top;
  color: #d8e4f2;
  font-size: 0.9rem;
}

.habits-table th {
  background: rgba(46, 82, 116, 0.82);
  border-bottom: 1px solid rgba(186, 216, 247, 0.52);
  font-weight: 800;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.45px;
  font-size: 0.78rem;
}

.habits-table tbody tr {
  background: rgba(41, 73, 101, 0.4);
  transition: background-color 0.2s ease;
}

.habits-table tbody tr:nth-child(even) {
  background: rgba(33, 63, 90, 0.44);
}

.habits-table tbody tr:hover {
  background: rgba(126, 163, 206, 0.42);
}

.habits-table tbody tr.selectedRow {
  background: rgba(79, 157, 255, 0.28);
}

.selectColumn {
  width: 42px;
  min-width: 42px;
  text-align: center;
}

.selectColumn input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.tableNotes,
.tableDetails {
  max-width: 300px;
}

.tableNotes {
  white-space: normal;
  line-height: 1.4;
}

.tableDetailsList {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.25rem;
}

.tableDetailsItem {
  line-height: 1.35;
}

.tableDetailsKey {
  font-weight: 800;
  color: var(--accent-blue);
  margin-right: 0.2rem;
}

.tableDetailsValue {
  color: #cfe0f2;
  word-break: break-word;
}

.tableActions {
  display: flex;
  gap: 0.5rem;
  min-width: 160px;
}

.tableActionBtn {
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
  color: white;
  transition: transform 0.15s ease, filter 0.2s ease;
}

.tableActionBtn.edit {
  background: linear-gradient(135deg, #384c6b, #4f9dff);
}

.tableActionBtn.delete {
  background: linear-gradient(135deg, #a4161a, #dc2626);
}

.tableActionBtn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.tableActionBtn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.06);
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
    width: 108px;
    min-height: 40px;
    flex: 0 0 108px;
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
    width: 96px;
    flex: 0 0 96px;
  }

  .selectedCount {
    display: none;
  }
}
</style>
