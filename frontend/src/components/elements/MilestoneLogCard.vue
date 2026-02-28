<template>
  <article class="milestoneLogCard" :style="getCardVars(item.id)">
    <header class="logHeader">
      <label v-if="selectionEnabled" class="selectToggle" :title="isSelected ? 'Unselect milestone' : 'Select milestone'">
        <input
          type="checkbox"
          :checked="isSelected"
          @change="emit('toggleSelection', item.id)"
          :aria-label="`Select milestone ${item.id}`"
        />
      </label>
      <h3 class="milestoneTitle">{{ item.title || 'Untitled Milestone' }}</h3>
      <div class="headerBadges">
        <span class="categoryBadge">{{ item.category || 'Uncategorized' }}</span>
      </div>
    </header>

    <section class="logGrid" aria-label="Milestone log details">
      <div class="logCell logCellMeta">
        <div class="metaHeadingRow">
          <p class="cellLabel">Logged At</p>
          <button class="starToggle" type="button" @click="emit('toggleFavorite', item.id)">
            <span :class="['star', { active: item.favorite }]">★</span>
          </button>
        </div>
        <p class="cellValue">{{ formatDate(item.occurredAt) }}</p>
      </div>

      <div class="logCell">
        <p class="cellLabel">Mood</p>
        <p class="cellValue">{{ item.mood || 'N/A' }}</p>
      </div>

      <div class="logCell">
        <p class="cellLabel">Favorite</p>
        <p class="cellValue">
          <span class="boolBadge" :class="item.favorite ? 'yes' : 'no'">
            {{ item.favorite ? 'Starred' : 'Not starred' }}
          </span>
        </p>
      </div>

      <div class="logCell logCellWide" v-if="item.tags?.length">
        <p class="cellLabel">Tags</p>
        <p class="cellValue longText">{{ item.tags.join(', ') }}</p>
      </div>

      <div class="logCell logCellWide">
        <p class="cellLabel">Notes</p>
        <p class="cellValue longText">{{ item.notes || 'N/A' }}</p>
      </div>
    </section>

    <footer v-if="showActionsColumn" class="cardActions">
      <button class="delete-log-btn" type="button" @click="emit('deleteMilestone', item.id)">
        🗑️ Delete
      </button>
    </footer>
  </article>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
  showActionsColumn: {
    type: Boolean,
    default: false,
  },
  selectionEnabled: {
    type: Boolean,
    default: false,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggleFavorite', 'deleteMilestone', 'toggleSelection'])

const milestonePalette = {
  accent: '#7c3aed',
  gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  tint: 'rgba(124, 58, 237, 0.14)',
}

const getCardVars = () => {
  const palette = milestonePalette
  return {
    '--milestone-accent': palette.accent,
    '--milestone-gradient': palette.gradient,
    '--milestone-tint': palette.tint,
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
</script>

<style scoped>
.milestoneLogCard {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  border-radius: var(--radius-medium);
  border: 2px solid var(--milestone-tint);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(235, 247, 255, 0.92));
  box-shadow: 0 10px 24px rgba(15, 32, 64, 0.14);
  padding: 0.9rem;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.milestoneLogCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(15, 32, 64, 0.2);
  border-color: var(--milestone-accent);
}

.logHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  border-radius: var(--radius-small) var(--radius-small) 0 0;
  background: var(--milestone-gradient);
  padding: 0.6rem 0.75rem;
  margin: -0.9rem -0.9rem 0 -0.9rem;
  min-width: 0;
}

.selectToggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.selectToggle input[type='checkbox'] {
  cursor: pointer;
  width: 14px;
  height: 14px;
}

.headerBadges {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  width: 50%;
}

.milestoneTitle {
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
  color: var(--milestone-accent);
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
  border: 1px solid var(--milestone-tint);
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

.logCellWide {
  grid-column: 1 / -1;
}

.cellLabel {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.45px;
  font-weight: 700;
  color: var(--milestone-accent);
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

.starToggle {
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.star {
  font-size: 1rem;
  color: #cbd5e1;
  transition: color 0.2s;
}

.star.active {
  color: #f5a524;
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

.delete-log-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 12px rgba(244, 63, 94, 0.32);
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
