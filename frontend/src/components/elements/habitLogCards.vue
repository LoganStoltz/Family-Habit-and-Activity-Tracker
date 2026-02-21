<template>
  <article class="habitLogCard">
    <header class="logHeader">
      <h3 class="habitTitle">{{ log.habitName || 'Unknown Habit' }}</h3>
      <span class="categoryBadge">{{ log.category || 'N/A' }}</span>
    </header>

    <section class="logGrid" aria-label="Habit log details">
      <div class="logCell">
        <p class="cellLabel">Logged At</p>
        <p class="cellValue">{{ formatDate(log.created_at || log.updated_at) }}</p>
      </div>

      <div class="logCell">
        <p class="cellLabel">Log ID</p>
        <p class="cellValue mono">#{{ log.id }}</p>
      </div>

      <div class="logCell logCellWide">
        <p class="cellLabel">Details</p>
        <p class="cellValue longText">{{ formatExtraData(log.extra_data) }}</p>
      </div>

      <div class="logCell logCellWide">
        <p class="cellLabel">Notes</p>
        <p class="cellValue longText">{{ log.notes || 'N/A' }}</p>
      </div>
    </section>

    <footer v-if="showActionsColumn" class="cardActions">
      <button
        class="delete-log-btn"
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

const emit = defineEmits(['confirmDeleteLog'])

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
</script>

<style scoped>
.habitLogCard {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  border-radius: var(--radius-medium);
  border: 1px solid rgba(116, 235, 213, 0.45);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(235, 247, 255, 0.92));
  box-shadow: 0 10px 24px rgba(15, 32, 64, 0.14);
  padding: 0.9rem;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.habitLogCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(15, 32, 64, 0.2);
}

.logHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  border-radius: var(--radius-small);
  background: var(--heading-gradient);
  padding: 0.6rem 0.75rem;
}

.habitTitle {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.03rem;
  line-height: 1.25;
  font-weight: 800;
}

.categoryBadge {
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.45px;
  text-transform: uppercase;
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  padding: 0.22rem 0.52rem;
}

.logGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.logCell {
  min-height: 82px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(79, 157, 255, 0.25);
  border-radius: var(--radius-small);
  padding: 0.55rem 0.65rem;
}

.logCellWide {
  grid-column: span 1;
}

.cellLabel {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.45px;
  font-weight: 700;
  color: rgba(26, 46, 73, 0.74);
}

.cellValue {
  margin: 0.28rem 0 0;
  color: #1d324f;
  font-size: 0.92rem;
  line-height: 1.45;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  letter-spacing: 0.15px;
}

.longText {
  white-space: pre-wrap;
  font-weight: 500;
}

.cardActions {
  padding-top: 0.1rem;
}

.delete-log-btn {
  padding: 0.5rem 0.86rem;
  background: linear-gradient(135deg, #f43f5e, #e11d48);
  color: white;
  border: none;
  border-radius: var(--radius-small);
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 700;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), opacity var(--transition-fast);
  box-shadow: 0 3px 8px rgba(244, 63, 94, 0.24);
}

.delete-log-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 12px rgba(244, 63, 94, 0.32);
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
}
</style>
