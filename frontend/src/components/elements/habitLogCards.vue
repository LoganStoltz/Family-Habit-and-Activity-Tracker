<template>
  <article class="habitLogCard" :style="getCardVars(log.habit_id || log.id)">
    <header class="logHeader">
      <h3 class="habitTitle">{{ log.habitName || 'Unknown Habit' }}</h3>
      <div class="headerBadges">
        <span class="categoryBadge">{{ log.category || 'N/A' }}</span>
      </div>
    </header>

    <section class="logGrid" aria-label="Habit log details">
      <div class="logCell logCellMeta">
        <div class="metaHeadingRow">
          <p class="cellLabel">Logged At</p>
          <span class="metaOrdinalBadge">{{ formatOrdinal(log.habitLogOrdinal || 0) }} entry</span>
        </div>
        <p class="cellValue">{{ formatDate(log.created_at || log.updated_at) }}</p>
      </div>

      <div class="logCell logCellWide">
        <p class="cellLabel">Details</p>
        <dl v-if="getDetailEntries(log.extra_data).length" class="detailList">
          <div
            v-for="entry in getDetailEntries(log.extra_data)"
            :key="entry.key"
            class="detailRow"
          >
            <dt class="detailKey">{{ entry.label }}</dt>
            <dd class="detailValue">
              <span v-if="entry.type === 'boolean'" class="boolBadge" :class="entry.value ? 'yes' : 'no'">
                {{ entry.value ? 'Yes' : 'No' }}
              </span>
              <span v-else>{{ entry.display }}</span>
            </dd>
          </div>
        </dl>
        <p v-else class="cellValue longText">N/A</p>
      </div>

      <div class="logCell logCellWide">
        <p class="cellLabel">Notes</p>
        <p class="cellValue longText">{{ log.notes || 'N/A' }}</p>
      </div>
    </section>

    <footer v-if="showActionsColumn" class="cardActions">
      <button
        class="edit-log-btn card-action-btn"
        @click="emit('editHabit', log)"
      >
        ✏️ Edit Habit
      </button>
      <button
        class="delete-log-btn card-action-btn"
        @click="emit('confirmDeleteLog', log)"
        :disabled="deletingLogId === log.id"
      >
        {{ deletingLogId === log.id ? 'Deleting...' : '🗑️ Delete' }}
      </button>
    </footer>
  </article>
</template>

<script setup>
defineProps({
  log: {
    type: Object,
    required: true,
  },
  showActionsColumn: {
    type: Boolean,
    default: false,
  },
  deletingLogId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['confirmDeleteLog', 'editHabit'])

const getPalette = (habitId) => {
  const options = [
    { accent: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)', tint: 'rgba(37, 99, 235, 0.14)' },
    { accent: '#16a34a', gradient: 'linear-gradient(135deg, #16a34a, #34d399)', tint: 'rgba(22, 163, 74, 0.14)' },
    { accent: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #fdba74)', tint: 'rgba(249, 115, 22, 0.16)' },
    { accent: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)', tint: 'rgba(124, 58, 237, 0.14)' },
    { accent: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9, #22d3ee)', tint: 'rgba(14, 165, 233, 0.14)' },
  ]

  const numericId = Number(habitId) || 0
  return options[numericId % options.length]
}

const getCardVars = (habitId) => {
  const palette = getPalette(habitId)
  return {
    '--habit-accent': palette.accent,
    '--habit-gradient': palette.gradient,
    '--habit-tint': palette.tint,
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'N/A'

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatOrdinal = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return 'N/A'

  const lastTwo = number % 100
  if (lastTwo >= 11 && lastTwo <= 13) return `${number}th`

  const lastDigit = number % 10
  if (lastDigit === 1) return `${number}st`
  if (lastDigit === 2) return `${number}nd`
  if (lastDigit === 3) return `${number}rd`
  return `${number}th`
}

const toDisplayLabel = (key) => {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())
}

const isLikelyIsoDate = (value) => {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
}

const formatDetailValue = (value) => {
  if (value == null || value === '') return 'N/A'

  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US').format(value)
  }

  if (typeof value === 'string') {
    if (isLikelyIsoDate(value)) return formatDate(value)
    return value
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return 'N/A'
    return value.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(', ')
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) return 'N/A'
    return `${keys.length} fields`
  }

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

const getDetailEntries = (extraData) => {
  const objectData = parseExtraDataObject(extraData)
  if (!objectData) return []

  return Object.keys(objectData)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const value = objectData[key]
      const type = typeof value === 'boolean' ? 'boolean' : 'text'

      return {
        key,
        label: toDisplayLabel(key),
        value,
        type,
        display: formatDetailValue(value),
      }
    })
}
</script>

<style scoped>
.habitLogCard {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  border-radius: var(--radius-medium);
  border: 2px solid var(--habit-tint);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(235, 247, 255, 0.92));
  box-shadow: 0 10px 24px rgba(15, 32, 64, 0.14);
  padding: 0.9rem;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.habitLogCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(15, 32, 64, 0.2);
  border-color: var(--habit-accent);
}

.logHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  border-radius: var(--radius-small) var(--radius-small) 0 0;
  background: var(--habit-gradient);
  padding: 0.6rem 0.75rem;
  margin: -0.9rem -0.9rem 0 -0.9rem;
  min-width: 0;
}

.headerBadges {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  width: 50%;
}

.habitTitle {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.03rem;
  line-height: 1.25;
  font-weight: 800;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.categoryBadge {
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.45px;
  text-transform: uppercase;
  color: var(--habit-accent);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  padding: 0.22rem 0.52rem;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.logCell {
  min-height: 82px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid var(--habit-tint);
  border-radius: var(--radius-small);
  padding: 0.55rem 0.65rem;
}

.logCellMeta {
  grid-column: 1 / -1;
  min-height: unset;
}

.metaHeadingRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.metaHeadingRow .cellLabel {
  margin: 0;
}

.metaOrdinalBadge {
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.35px;
  text-transform: uppercase;
  color: var(--habit-accent);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--habit-tint);
  border-radius: 999px;
  padding: 0.18rem 0.5rem;
}

.logCellWide {
  grid-column: 1 / -1;
}

.cellLabel {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.45px;
  font-weight: 700;
  color: var(--habit-accent);
}

.cellValue {
  margin: 0.28rem 0 0;
  color: #1d324f;
  font-size: 0.92rem;
  line-height: 1.45;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.longText {
  white-space: pre-wrap;
  font-weight: 500;
}

.detailList {
  margin: 0.3rem 0 0;
  display: grid;
  gap: 0.32rem;
}

.detailRow {
  display: grid;
  grid-template-columns: minmax(90px, 42%) minmax(0, 1fr);
  align-items: start;
  gap: 0.55rem;
}

.detailKey,
.detailValue {
  margin: 0;
}

.detailKey {
  color: rgba(29, 50, 79, 0.78);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.35;
}

.detailValue {
  color: #1d324f;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.boolBadge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.08rem 0.48rem;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid transparent;
}

.boolBadge.yes {
  color: #0f766e;
  background: rgba(20, 184, 166, 0.14);
  border-color: rgba(20, 184, 166, 0.32);
}

.boolBadge.no {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.28);
}

.cardActions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
  padding-top: 0.1rem;
}

.card-action-btn {
  border: 1px solid #d9e2ec;
  border-radius: 12px;
  padding: 0.78rem 1.15rem;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 800;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-fast);
  width: 200px;
}

.edit-log-btn {
  background: #0f172a;
  color: #f8fafc;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
}

.edit-log-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.22);
}

.delete-log-btn {
  background: linear-gradient(135deg, #f43f5e, #e11d48);
  color: white;
  border: none;
  box-shadow: 0 12px 24px rgba(244, 63, 94, 0.24);
}

.delete-log-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(244, 63, 94, 0.3);
}

.delete-log-btn:disabled {
  opacity: 0.62;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 560px) {
  .logGrid {
    grid-template-columns: 1fr;
  }

  .logCell {
    min-height: unset;
  }

  .card-action-btn {
    width: 100%;
  }
}
</style>
