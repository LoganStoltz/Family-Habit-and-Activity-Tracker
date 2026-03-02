<template>
  <div class="pdfBuilderPage">

    <section class="overviewSection" :class="{ collapsed: isOverviewCollapsed }">
      <close-element @minimize="emit('minimize')" :showCollapse="true" @toggle="handleOverviewToggle" />
      <div class="sectionHeader">
        <div class="header-left"></div>
        <h1>All Habit Logs & Milestones</h1>
        <div class="header-right"></div>
      </div>

      <div class="sectionBody">
        <div v-if="overviewLoading" class="emptyState">
          <p>Loading habit logs and milestones...</p>
        </div>

        <div v-else-if="overviewError" class="emptyState">
          <p>{{ overviewError }}</p>
        </div>

        <div v-else class="overviewGrid">
          <div class="compactPanel">
            <div class="compactPanelHeader">
              <h3>Habit Logs</h3>
              <span>{{ allHabitLogs.length }}</span>
            </div>
            <div v-if="!allHabitLogs.length" class="compactEmpty">No habit logs found.</div>
            <ul v-else class="compactList">
              <li v-for="log in allHabitLogs" :key="`habit-log-${log.id}`" class="compactItem">
                <div class="compactCopy">
                  <span class="compactTitle">{{ log.habitName || `Habit Log #${log.id}` }}</span>
                  <span class="compactMeta">{{ log.category || 'N/A' }} • {{ formatCompactDate(log.created_at) }} • Log {{ log.habitIteration || 0 }}/{{ log.habitTotal || 0 }}</span>
                </div>
                <button class="selectButton" :class="{ selected: isHabitLogSelected(log.id) }" @click="toggleHabitLogFromOverview(log)">
                  {{ isHabitLogSelected(log.id) ? 'Unselect' : 'Select' }}
                </button>
              </li>
            </ul>
          </div>

          <div class="compactPanel">
            <div class="compactPanelHeader">
              <h3>Milestones</h3>
              <span>{{ allMilestones.length }}</span>
            </div>
            <div v-if="!allMilestones.length" class="compactEmpty">No milestones found.</div>
            <ul v-else class="compactList">
              <li v-for="milestone in allMilestones" :key="milestone.id" class="compactItem">
                <div class="compactCopy">
                  <span class="compactTitle">{{ milestone.title || `Milestone #${milestone.id}` }}</span>
                  <span class="compactMeta">{{ milestone.category || 'Uncategorized' }} • {{ formatCompactDate(milestone.occurredAt) }} • Milestone {{ milestone.categoryIteration || 0 }}/{{ milestone.categoryTotal || 0 }}</span>
                </div>
                <button class="selectButton" :class="{ selected: isMilestoneSelected(milestone.id) }" @click="toggleMilestoneFromOverview(milestone)">
                  {{ isMilestoneSelected(milestone.id) ? 'Unselect' : 'Select' }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="selectionSection" :class="{ collapsed: isSelectionCollapsed }">
      <close-element @minimize="emit('minimize')" :showCollapse="true" @toggle="handleSelectionToggle" />
      <div class="sectionHeader">
        <div class="header-left"></div>
        <h1>Selected Entries</h1>
        <div class="header-right"></div>
      </div>

      <div class="sectionBody">
        <div class="tabs">
          <button
            class="tabButton"
            :class="{ active: activeTab === 'habit-logs' }"
            @click="setActiveTab('habit-logs')"
          >
            Habit Logs ({{ habitLogs.length }})
          </button>
          <button
            class="tabButton"
            :class="{ active: activeTab === 'milestones' }"
            @click="setActiveTab('milestones')"
          >
            Milestones ({{ milestones.length }})
          </button>
        </div>

        <div v-if="!activeItems.length" class="emptyState">
          <p>No selected {{ activeTabLabel }} yet.</p>
          <p class="emptyHint">Use Select/Unselect in the section above.</p>
        </div>

        <div v-else class="selectionList">
          <article v-for="(item, index) in activeItems" :key="item.id" class="selectionCard">
            <div class="selectionMain">
              <h3>{{ formatSelectionTitle(item) }}</h3>
              <p>{{ formatSelectionSubtitle(item) }}</p>
            </div>
            <span class="selectionIndex">#{{ index + 1 }}</span>
          </article>
        </div>
      </div>
    </section>

    <section class="pdfSection" :class="{ collapsed: isPdfCollapsed }">
      <close-element @minimize="emit('minimize')" :showCollapse="true" @toggle="handlePdfToggle" />
      <div class="sectionHeader">
        <div class="header-left"></div>
        <h1>PDF Section</h1>
        <div class="header-right"></div>
      </div>

      <div class="sectionBody">
        <div v-if="!activeItems.length" class="emptyState">
          <p>Add selections first to reorder and export.</p>
        </div>

        <div v-else class="pdfOrderList">
          <article v-for="(item, index) in activeItems" :key="`${activeTab}-${item.id}`" class="pdfOrderCard">
            <div class="pdfOrderInfo">
              <span class="orderBadge">{{ index + 1 }}</span>
              <div>
                <h4>{{ formatSelectionTitle(item) }}</h4>
                <p>{{ formatSelectionSubtitle(item) }}</p>
              </div>
            </div>
            <div class="pdfOrderActions">
              <button class="orderButton" @click="moveItem(index, -1)" :disabled="index === 0">↑</button>
              <button class="orderButton" @click="moveItem(index, 1)" :disabled="index === activeItems.length - 1">↓</button>
              <button class="removeButton" @click="removeItem(index)">Remove</button>
            </div>
          </article>

          <div class="pdfActions">
            <button class="secondaryAction" @click="clearActiveTab">Clear Tab</button>
            <button class="primaryAction" @click="exportToPdf">Export {{ activeTabLabel }} PDF</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { jsPDF } from 'jspdf'
import { apiRequest } from '../../config/api.js'
import closeElement from '../elements/closeElement.vue'

const emit = defineEmits(['toggle', 'minimize'])

const HABIT_STORAGE_KEY = 'selectedHabitLogsForPdf'
const MILESTONE_STORAGE_KEY = 'selectedMilestonesForPdf'
const TAB_STORAGE_KEY = 'pdfBuilderActiveTab'

const parseStoredArray = (key) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const habitLogs = ref(parseStoredArray(HABIT_STORAGE_KEY))
const milestones = ref(parseStoredArray(MILESTONE_STORAGE_KEY))
const allHabitLogs = ref([])
const allMilestones = ref([])
const overviewLoading = ref(false)
const overviewError = ref('')

const user = JSON.parse(localStorage.getItem('user') || '{}')
const profile = JSON.parse(localStorage.getItem('profile') || '{}')
const userId = user?.id
const profileId = profile?.id

const initialTab = localStorage.getItem(TAB_STORAGE_KEY)
const activeTab = ref(initialTab === 'milestones' ? 'milestones' : 'habit-logs')
const isOverviewCollapsed = ref(false)
const isSelectionCollapsed = ref(false)
const isPdfCollapsed = ref(false)

const handleOverviewToggle = (collapsed) => {
  isOverviewCollapsed.value = collapsed
  emit('toggle', collapsed)
}

const handleSelectionToggle = (collapsed) => {
  isSelectionCollapsed.value = collapsed
  emit('toggle', collapsed)
}

const handlePdfToggle = (collapsed) => {
  isPdfCollapsed.value = collapsed
  emit('toggle', collapsed)
}

const activeItems = computed(() => {
  return activeTab.value === 'milestones' ? milestones.value : habitLogs.value
})

const activeTabLabel = computed(() => {
  return activeTab.value === 'milestones' ? 'milestones' : 'habit logs'
})

const setActiveTab = (tab) => {
  activeTab.value = tab
  localStorage.setItem(TAB_STORAGE_KEY, tab)
}

const formatDate = (value) => {
  if (!value) return 'No date'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'No date'

  return parsed.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCompactDate = (value) => {
  if (!value) return 'No date'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'No date'

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const toSafeTimestamp = (value) => {
  const dateValue = new Date(value)
  const timestamp = dateValue.getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const appendHabitIterations = (logs) => {
  const grouped = logs.reduce((accumulator, log) => {
    const key = String(log.habit_id || 'unknown')
    if (!accumulator[key]) accumulator[key] = []
    accumulator[key].push(log)
    return accumulator
  }, {})

  const iterationMap = {}

  Object.values(grouped).forEach((groupLogs) => {
    const sorted = [...groupLogs].sort((a, b) => {
      const timeDiff = toSafeTimestamp(a.created_at) - toSafeTimestamp(b.created_at)
      if (timeDiff !== 0) return timeDiff
      return (a.id || 0) - (b.id || 0)
    })

    const total = sorted.length
    sorted.forEach((log, index) => {
      iterationMap[log.id] = {
        habitIteration: index + 1,
        habitTotal: total
      }
    })
  })

  return logs.map((log) => ({
    ...log,
    habitIteration: iterationMap[log.id]?.habitIteration || 0,
    habitTotal: iterationMap[log.id]?.habitTotal || 0
  }))
}

const appendMilestoneIterations = (milestoneItems) => {
  const grouped = milestoneItems.reduce((accumulator, milestone) => {
    const key = milestone.category || 'Uncategorized'
    if (!accumulator[key]) accumulator[key] = []
    accumulator[key].push(milestone)
    return accumulator
  }, {})

  const iterationMap = {}

  Object.values(grouped).forEach((groupMilestones) => {
    const sorted = [...groupMilestones].sort((a, b) => {
      const timeDiff = toSafeTimestamp(a.occurredAt) - toSafeTimestamp(b.occurredAt)
      if (timeDiff !== 0) return timeDiff
      return (a.id || 0) - (b.id || 0)
    })

    const total = sorted.length
    sorted.forEach((milestone, index) => {
      iterationMap[milestone.id] = {
        categoryIteration: index + 1,
        categoryTotal: total
      }
    })
  })

  return milestoneItems.map((milestone) => ({
    ...milestone,
    categoryIteration: iterationMap[milestone.id]?.categoryIteration || 0,
    categoryTotal: iterationMap[milestone.id]?.categoryTotal || 0
  }))
}

const fetchOverviewData = async () => {
  if (!userId || !profileId) {
    overviewError.value = 'User or profile missing — please log in again.'
    return
  }

  overviewLoading.value = true
  overviewError.value = ''

  try {
    const [habitsResponse, milestonesResponse] = await Promise.all([
      apiRequest(`/users/${userId}/profiles/${profileId}/habits`),
      apiRequest(`/users/${userId}/profiles/${profileId}/milestones`)
    ])

    const habitsArray = Array.isArray(habitsResponse) ? habitsResponse : []
    const logsByHabit = await Promise.all(
      habitsArray.map(async (habit) => {
        try {
          const logs = await apiRequest(`/habits/${habit.id}/habit_logs`)
          const logsArray = Array.isArray(logs) ? logs : []
          return logsArray.map((log) => ({
            id: log.id,
            habitName: habit.name || 'Unknown Habit',
            category: habit.category || 'N/A',
            created_at: log.created_at || log.updated_at,
            notes: log.notes || '',
            extra_data: log.extra_data || null,
            habit_id: habit.id,
          }))
        } catch {
          return []
        }
      })
    )

    const flattenedLogs = logsByHabit.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    allHabitLogs.value = appendHabitIterations(flattenedLogs)

    const normalizedMilestones = Array.isArray(milestonesResponse)
      ? milestonesResponse.map((milestone) => ({
          id: milestone.id,
          title: milestone.title,
          category: milestone.category || 'Uncategorized',
          occurredAt: milestone.occurred_at || milestone.occurredAt
        }))
      : []

    allMilestones.value = appendMilestoneIterations(normalizedMilestones)
  } catch (err) {
    console.error(err)
    overviewError.value = err?.message || 'Could not load habit logs and milestones.'
  } finally {
    overviewLoading.value = false
  }
}

const isHabitLogSelected = (id) => habitLogs.value.some((item) => item.id === id)

const toggleHabitLogFromOverview = (log) => {
  if (isHabitLogSelected(log.id)) {
    habitLogs.value = habitLogs.value.filter((item) => item.id !== log.id)
  } else {
    habitLogs.value = [...habitLogs.value, log]
  }

  localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(habitLogs.value))
}

const isMilestoneSelected = (id) => milestones.value.some((item) => item.id === id)

const toggleMilestoneFromOverview = (milestone) => {
  if (isMilestoneSelected(milestone.id)) {
    milestones.value = milestones.value.filter((item) => item.id !== milestone.id)
  } else {
    milestones.value = [...milestones.value, milestone]
  }

  localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(milestones.value))
}

const formatSelectionTitle = (item) => {
  if (activeTab.value === 'milestones') {
    return item.title || `Milestone #${item.id}`
  }

  return item.habitName || `Habit Log #${item.id}`
}

const formatSelectionSubtitle = (item) => {
  if (activeTab.value === 'milestones') {
    const tags = Array.isArray(item.tags) && item.tags.length ? ` • Tags: ${item.tags.join(', ')}` : ''
    return `${item.category || 'Uncategorized'} • ${formatDate(item.occurredAt)}${tags}`
  }

  return `${item.category || 'N/A'} • ${formatDate(item.created_at)}`
}

const persistCurrentTabItems = () => {
  if (activeTab.value === 'milestones') {
    localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(milestones.value))
    return
  }

  localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(habitLogs.value))
}

const moveItem = (index, direction) => {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= activeItems.value.length) return

  const source = [...activeItems.value]
  const [moved] = source.splice(index, 1)
  source.splice(targetIndex, 0, moved)

  if (activeTab.value === 'milestones') {
    milestones.value = source
  } else {
    habitLogs.value = source
  }

  persistCurrentTabItems()
}

const removeItem = (index) => {
  const source = [...activeItems.value]
  source.splice(index, 1)

  if (activeTab.value === 'milestones') {
    milestones.value = source
  } else {
    habitLogs.value = source
  }

  persistCurrentTabItems()
}

const clearActiveTab = () => {
  if (activeTab.value === 'milestones') {
    milestones.value = []
    localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify([]))
    return
  }

  habitLogs.value = []
  localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify([]))
}

const addWrappedLine = (doc, text, y, left = 14, width = 180) => {
  const safeText = text || 'N/A'
  const lines = doc.splitTextToSize(String(safeText), width)
  let nextY = y

  lines.forEach((line) => {
    if (nextY > 280) {
      doc.addPage()
      nextY = 20
    }

    doc.text(line, left, nextY)
    nextY += 6
  })

  return nextY
}

const toDisplayLabel = (key) => {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())
}

const formatExtraDataValue = (value) => {
  if (value == null || value === '') return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'N/A'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return 'N/A'
    }
  }

  return String(value)
}

const parseExtraDataObject = (value) => {
  if (!value) return null

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      return null
    }
  }

  return null
}

const getExtraDataDetailLines = (extraData) => {
  const parsedObject = parseExtraDataObject(extraData)
  if (!parsedObject) {
    const fallback = formatExtraDataValue(extraData)
    return [`Details: ${fallback}`]
  }

  const keys = Object.keys(parsedObject).sort((a, b) => a.localeCompare(b))
  if (!keys.length) return ['Details: N/A']

  return [
    'Details:',
    ...keys.map((key) => `• ${toDisplayLabel(key)}: ${formatExtraDataValue(parsedObject[key])}`)
  ]
}

const exportToPdf = () => {
  if (!activeItems.value.length) return

  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text(activeTab.value === 'milestones' ? 'Selected Milestones' : 'Selected Habit Logs', 14, 18)

  doc.setFontSize(11)
  let y = 28

  activeItems.value.forEach((item, index) => {
    if (y > 270) {
      doc.addPage()
      y = 20
    }

    const header = activeTab.value === 'milestones'
      ? `${index + 1}. ${item.title || `Milestone #${item.id}`}`
      : `${index + 1}. ${item.habitName || `Habit Log #${item.id}`}`

    doc.setFont(undefined, 'bold')
    y = addWrappedLine(doc, header, y)

    doc.setFont(undefined, 'normal')

    if (activeTab.value === 'milestones') {
      y = addWrappedLine(doc, `Category: ${item.category || 'Uncategorized'}`, y)
      y = addWrappedLine(doc, `Occurred: ${formatDate(item.occurredAt)}`, y)
      y = addWrappedLine(doc, `Mood: ${item.mood || 'N/A'}`, y)
      y = addWrappedLine(doc, `Favorite: ${item.favorite ? 'Yes' : 'No'}`, y)
      y = addWrappedLine(doc, `Tags: ${Array.isArray(item.tags) && item.tags.length ? item.tags.join(', ') : 'N/A'}`, y)
      y = addWrappedLine(doc, `Notes: ${item.notes || 'N/A'}`, y)
    } else {
      y = addWrappedLine(doc, `Category: ${item.category || 'N/A'}`, y)
      y = addWrappedLine(doc, `Logged At: ${formatDate(item.created_at)}`, y)
      y = addWrappedLine(doc, `Notes: ${item.notes || 'N/A'}`, y)

      const detailLines = getExtraDataDetailLines(item.extra_data)
      detailLines.forEach((line, lineIndex) => {
        y = addWrappedLine(doc, line, y, lineIndex === 0 ? 14 : 18)
      })
    }

    y += 4
    doc.line(14, y, 196, y)
    y += 8
  })

  const fileName = activeTab.value === 'milestones' ? 'milestones-report.pdf' : 'habit-logs-report.pdf'
  doc.save(fileName)
}

onMounted(fetchOverviewData)
</script>

<style scoped>
.pdfBuilderPage {
  max-width: 1600px;
  margin: 20px auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.selectionSection,
.overviewSection,
.pdfSection {
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: 20px 0;
  overflow: visible;
  padding: 20px;
  position: relative;
}

.selectionSection.collapsed,
.overviewSection.collapsed,
.pdfSection.collapsed {
  padding: 0 20px 20px 20px;
  box-shadow: none;
}

.selectionSection :deep(.button-group),
.overviewSection :deep(.button-group),
.pdfSection :deep(.button-group) {
  top: 0px;
  left: 0px;
  right: auto;
  height: 30px;
  z-index: 0;
}

.sectionHeader {
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

.selectionSection.collapsed .sectionHeader,
.overviewSection.collapsed .sectionHeader,
.pdfSection.collapsed .sectionHeader {
  margin: 0 -20px 0 -20px;
  border-radius: 12px;
}

.sectionHeader h1 {
  margin: 0;
  font-size: 1.5rem;
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

.sectionBody {
  transition: all 0.3s ease;
}

.selectionSection.collapsed .sectionBody,
.overviewSection.collapsed .sectionBody,
.pdfSection.collapsed .sectionBody {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
}

.tabs {
  display: flex;
  gap: 0.75rem;
  padding: 16px 20px 0;
}

.tabButton {
  border: none;
  border-radius: 999px;
  padding: 0.55rem 1rem;
  font-weight: 700;
  cursor: pointer;
  background: rgba(79, 157, 255, 0.15);
  color: #1d3b56;
}

.tabButton.active {
  background: #4f9dff;
  color: white;
}

.selectionList,
.pdfOrderList {
  padding: 16px 20px 20px;
  display: grid;
  gap: 0.75rem;
}

.selectionCard,
.pdfOrderCard {
  background: #ffffff;
  border: 1px solid #dfe8f5;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.selectionMain h3,
.pdfOrderInfo h4 {
  margin: 0;
  color: #2c3f57;
}

.selectionMain p,
.pdfOrderInfo p {
  margin: 0.35rem 0 0;
  color: #4b5d75;
  font-size: 0.92rem;
}

.selectionIndex,
.orderBadge {
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eaf4ff;
  color: #2f6bff;
  font-weight: 700;
  font-size: 0.85rem;
}

.pdfOrderInfo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pdfOrderActions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.orderButton,
.removeButton,
.secondaryAction,
.primaryAction {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.orderButton {
  background: #eaf4ff;
  color: #2f6bff;
  min-width: 38px;
}

.orderButton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.removeButton {
  background: #ffe7e7;
  color: #c73535;
}

.pdfActions {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.secondaryAction {
  background: #e6ecf6;
  color: #32455f;
}

.primaryAction {
  background: #4f9dff;
  color: white;
}

.emptyState {
  padding: 20px;
  color: #3f526c;
}

.emptyState p {
  margin: 0;
}

.emptyHint {
  margin-top: 0.35rem !important;
  color: #5b6f8a;
  font-size: 0.92rem;
}

.overviewGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 16px 20px 20px;
}

.compactPanel {
  background: #ffffff;
  border: 1px solid #dfe8f5;
  border-radius: 12px;
  padding: 12px;
}

.compactPanelHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.compactPanelHeader h3 {
  margin: 0;
  color: #2c3f57;
  font-size: 1rem;
}

.compactPanelHeader span {
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eaf4ff;
  color: #2f6bff;
  font-weight: 700;
  font-size: 0.85rem;
}

.compactList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.4rem;
  max-height: 600px;
  overflow-y: auto;
}

.compactItem {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.45rem 0.55rem;
  border-radius: 8px;
  background: #f7fbff;
}

.compactCopy {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
  flex: 1;
}

.compactTitle {
  color: #2f425b;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compactMeta {
  color: #5c6f88;
  font-size: 0.82rem;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.selectButton {
  border: none;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
  background: #eaf4ff;
  color: #2f6bff;
  white-space: nowrap;
}

.selectButton.selected {
  background: #dff3e5;
  color: #2b7f49;
}

.compactEmpty {
  color: #566b86;
  font-size: 0.9rem;
}

@media (max-width: 900px) {
  .tabs {
    flex-direction: column;
  }

  .overviewGrid {
    grid-template-columns: 1fr;
  }

  .pdfOrderCard,
  .selectionCard {
    flex-direction: column;
  }

  .pdfOrderActions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
