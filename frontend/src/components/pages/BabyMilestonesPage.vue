<template>
  <div class="milestonesPage">
    <!-- <h1>Baby Milestones Page</h1> -->

    <div class="milestonesContent">
    
      <section class="milestonesHeroSection">
        <close-element @minimize="$emit('minimize')" :showCollapse="true" @toggle="handleToggleMilestones" />
        <div class="milestoneSectionHeader">
          <h1>Milestones</h1>
        </div>
        <div class="closeElement" :class="{ collapsed: isMilestonesCollapsed }">
          <div class="content-grid">
            <div class="milestoneInfo">
              <p class="eyebrow">Baby milestones</p>
              <h1>Celebrate {{ profileName }}'s Milestones</h1>
              <p class="lede">
                Capture first giggles, tiny steps, and the everyday wonders so you never lose a moment.
              </p>
              <div class="milestoneStats">
                <div class="milestoneStatCard">
                  <span class="stat-label">Total milestones</span>
                  <span class="stat-value">{{ milestones.length }}</span>
                  <span class="stat-sub">Saved locally for this profile</span>
                </div>
                <div class="milestoneStatCard">
                  <span class="stat-label">This Month</span>
                  <span class="stat-value">{{ thisMonthCount }}</span>
                  <span class="stat-sub">Milestones added this month</span>
                </div>
                <div class="milestoneStatCard">
                  <span class="stat-label">Starred favorites</span>
                  <span class="stat-value">{{ favoriteCount }}</span>
                  <span class="stat-sub">Moments to cherish</span>
                </div>
                <div class="milestoneStatCard">
                  <span class="stat-label">Last updated</span>
                  <span class="stat-value">{{ lastUpdated }}</span>
                  <span class="stat-sub">Auto-saves as you go</span>
                </div>
                <div class="milestoneStatCard">
                  <span class="stat-label">Most active category</span>
                  <span class="stat-value">{{ topCategory || 'N/A' }}</span>
                  <span class="stat-sub">Category with the most milestones</span>
                </div>
                
              </div>
            </div>

            <div class="addMilestoneCard">
              <div class="card-header">
                <div>
                  <p class="eyebrow">Quick add</p>
                  <h3>Add a milestone</h3>
                </div>
                <span class="pill">Private</span>
              </div>
              <form class="quick-form" @submit.prevent="addMilestone">
                <label class="field">
                  <span>Title</span>
                  <input v-model.trim="form.title" type="text" placeholder="First steps, new word, big smile" required />
                </label>
                <div class="row">
                  <label class="field">
                    <span>Date</span>
                    <input v-model="form.date" type="date" required />
                  </label>
                  <label class="field">
                    <span>Time</span>
                    <input v-model="form.time" type="time" />
                  </label>
                </div>
                <div class="row">
                  <label class="field">
                    <span>Category</span>
                    <select v-model="form.category">
                      <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                    </select>
                  </label>
                  <label class="field">
                    <span>Mood</span>
                    <select v-model="form.mood">
                      <option v-for="mood in moods" :key="mood" :value="mood">{{ mood }}</option>
                    </select>
                  </label>
                </div>
                <label class="field">
                  <span>Notes</span>
                  <textarea v-model.trim="form.notes" rows="3" placeholder="What happened, who was there, tiny details..."></textarea>
                </label>
                <label class="field">
                  <span>Tags (comma separated)</span>
                  <input v-model.trim="form.tags" type="text" placeholder="family, first-word, video" />
                </label>
                <button class="primary" type="submit">Save milestone</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section class="filtersSection">
        <close-element @minimize="$emit('minimize')" :showCollapse="true" @toggle="handleToggleFilters" />
        <div class="milestoneSectionHeader">
          <h1>Filters</h1>
        </div>
        <div class="closeElement" :class=" { collapsed: isFiltersCollapsed }">
          <div class="filter-controls" >
            <label class="field">
              <span>Search</span>
              <input v-model.trim="filtersSection.search" type="text" placeholder="Find a milestone" />
            </label>
            <label class="field">
              <span>Category</span>
              <select v-model="filtersSection.category" :class="{ 'placeholder-active': !filtersSection.category }">
                <option value="">All</option>
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
            </label>
            <label class="field">
              <span>Time range</span>
              <select v-model="filtersSection.range" :class="{ 'placeholder-active': !filtersSection.range || filtersSection.range === 'all' }">
                <option value="all">All time</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </label>
            <label class="field">
              <span>Sort</span>
              <select v-model="filtersSection.sort" :class="{ 'placeholder-active': !filtersSection.sort }">
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
                <option value="favorite">Starred first</option>
              </select>
            </label>
            <button class="clearButton" type="button" @click="resetfiltersSection">Clear</button>
          </div>
        </div>
        
      </section>

      <section class="timelineSection">
        <close-element @minimize="$emit('minimize')" :showCollapse="true" @toggle="handleToggleMilestoneLogs" />
        <div class="milestoneSectionHeader">
          <h1>Milestone Logs</h1>
        </div>
        <div class="closeElement" :class=" { collapsed: isMilestoneLogsCollapsed }">
          <div class="timelineSection-content">
            <div v-if="loading" class="empty">
              <p>Loading milestones...</p>
            </div>
            <div v-else-if="error" class="empty error">
              <p>{{ error }}</p>
            </div>
            <div v-else-if="!filteredMilestones.length" class="empty">
              <p>No milestones yet. Add one to start the story.</p>
            </div>
            <div v-else class="timelineSection-list">
              <div v-for="group in groupedMilestones" :key="group.label" class="timelineSection-group">
                <div class="group-label">
                  <h4>{{ group.label }}</h4>
                  <span>{{ group.items.length }} saved</span>
                </div>
                <div class="timelineSection-items">
                  <article v-for="item in group.items" :key="item.id" class="timelineSection-card">
                    <div class="card-top">
                      <div class="card-meta">
                        <span class="pill pill-soft">{{ item.category }}</span>
                        <span class="muted">{{ formatDate(item.occurredAt) }}</span>
                      </div>
                      <button class="icon-btn" type="button" @click="toggleFavorite(item.id)">
                        <span :class="['star', { active: item.favorite }]">★</span>
                      </button>
                    </div>
                    <h3>{{ item.title }}</h3>
                    <p class="note" v-if="item.notes">{{ item.notes }}</p>
                    <div class="card-actions">
                      <span class="pill muted">Mood: {{ item.mood }}</span>
                      <div class="action-buttons">
                        <button class="ghost" type="button" @click="duplicateMilestone(item)">Duplicate</button>
                        <button class="danger" type="button" @click="deleteMilestone(item.id)">Delete</button>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '../../config/api.js'
import closeElement from '../elements/closeElement.vue'

const user = JSON.parse(localStorage.getItem('user') || '{}')
const profile = JSON.parse(localStorage.getItem('profile') || '{}')
const userId = user?.id
const profileId = profile?.id
const profileName = profile?.firstName || 'your little one'

const isMilestonesCollapsed = ref(false)
const isFiltersCollapsed = ref(false)
const isMilestoneLogsCollapsed = ref(false)
const emit = defineEmits(['toggle', 'minimize'])

const handleToggleMilestones = (collapsed) => {
  isMilestonesCollapsed.value = collapsed
  emit('toggle', collapsed)
}
const handleToggleFilters = (collapsed) => {
  isFiltersCollapsed.value = collapsed
  emit('toggle', collapsed)
}
const handleToggleMilestoneLogs = (collapsed) => {
  isMilestoneLogsCollapsed.value = collapsed
  emit('toggle', collapsed)
}

const categories = ['Firsts', 'Movement', 'Language', 'Health', 'Sleep', 'Social', 'Play', 'Growth']
const moods = ['Delighted', 'Proud', 'Curious', 'Sleepy', 'Playful', 'Comforted']

const form = ref({
  title: '',
  category: categories[0],
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  mood: moods[0],
  notes: '',
  tags: ''
})

const filtersSection = ref({
  search: '',
  category: '',
  range: '90',
  sort: 'desc'
})

const milestones = ref([])
const loading = ref(false)
const error = ref('')

const normalizeMilestone = (raw) => ({
  id: raw.id,
  title: raw.title,
  category: raw.category || 'Uncategorized',
  occurredAt: raw.occurred_at || raw.occurredAt,
  notes: raw.notes || '',
  mood: raw.mood || 'Delighted',
  tags: Array.isArray(raw.tags)
    ? raw.tags
    : raw.tags
      ? String(raw.tags)
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean)
      : [],
  favorite: Boolean(raw.favorite)
})

const fetchMilestones = async () => {
  if (!userId || !profileId) {
    error.value = 'User or profile missing — please log in again.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // apiRequest RETURNS JSON (and throws on HTTP errors)
    const data = await apiRequest(`/users/${userId}/profiles/${profileId}/milestones`)
    milestones.value = Array.isArray(data) ? data.map(normalizeMilestone) : []
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Could not load milestones'
  } finally {
    loading.value = false
  }
}

const addMilestone = async () => {
  if (!form.value.title.trim()) return

  const dateTime = new Date(`${form.value.date}T${form.value.time || '12:00'}`)
  const payload = {
    title: form.value.title.trim(),
    category: form.value.category,
    occurred_at: dateTime.toISOString(),
    notes: form.value.notes.trim(),
    mood: form.value.mood,
    tags: form.value.tags
      ? form.value.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [],
    favorite: false
  }

  try {
    // apiRequest RETURNS JSON (and throws on HTTP errors)
    const created = await apiRequest(`/users/${userId}/profiles/${profileId}/milestones`, {
      method: 'POST',
      body: JSON.stringify({ milestone: payload })
    })

    milestones.value = [normalizeMilestone(created), ...milestones.value]

    form.value = {
      title: '',
      category: categories[0],
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      mood: moods[0],
      notes: '',
      tags: ''
    }
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Could not save milestone'
  }
}

const deleteMilestone = async (id) => {
  const previous = [...milestones.value]
  milestones.value = milestones.value.filter(item => item.id !== id)

  try {
    // apiRequest will throw if DELETE fails
    await apiRequest(`/milestones/${id}`, { method: 'DELETE' })
  } catch (err) {
    console.error(err)
    milestones.value = previous
    error.value = err?.message || 'Could not delete milestone'
  }
}

const duplicateMilestone = async (item) => {
  const payload = {
    title: `${item.title}`,
    category: item.category,
    occurred_at: new Date(item.occurredAt).toISOString(),
    notes: item.notes,
    mood: item.mood,
    tags: item.tags,
    favorite: false
  }

  try {
    const created = await apiRequest(`/users/${userId}/profiles/${profileId}/milestones`, {
      method: 'POST',
      body: JSON.stringify({ milestone: payload })
    })
    milestones.value = [normalizeMilestone(created), ...milestones.value]
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Could not duplicate milestone'
  }
}

const toggleFavorite = async (id) => {
  const idx = milestones.value.findIndex(m => m.id === id)
  if (idx === -1) return

  const previous = milestones.value[idx]
  const updated = { ...previous, favorite: !previous.favorite }

  milestones.value = [
    ...milestones.value.slice(0, idx),
    updated,
    ...milestones.value.slice(idx + 1)
  ]

  try {
    // apiRequest will throw if PATCH fails
    await apiRequest(`/milestones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ milestone: { favorite: updated.favorite } })
    })
  } catch (err) {
    console.error(err)
    milestones.value = [
      ...milestones.value.slice(0, idx),
      previous,
      ...milestones.value.slice(idx + 1)
    ]
    error.value = err?.message || 'Could not update favorite'
  }
}

const resetfiltersSection = () => {
  filtersSection.value = { search: '', category: '', range: '90', sort: 'desc' }
}

const filteredMilestones = computed(() => {
  const search = filtersSection.value.search.toLowerCase()
  const now = Date.now()
  const rangeDays = filtersSection.value.range === 'all' ? null : Number(filtersSection.value.range)
  const threshold = rangeDays ? now - rangeDays * 24 * 60 * 60 * 1000 : null

  let result = milestones.value.filter(item => {
    const titleMatch = item.title?.toLowerCase().includes(search)
    const noteMatch = item.notes?.toLowerCase().includes(search)
    const matchesSearch = search ? (titleMatch || noteMatch) : true
    const matchesCategory = filtersSection.value.category ? item.category === filtersSection.value.category : true
    const withinRange = threshold ? new Date(item.occurredAt).getTime() >= threshold : true
    return matchesSearch && matchesCategory && withinRange
  })

  if (filtersSection.value.sort === 'favorite') {
    result = result.sort((a, b) => Number(b.favorite) - Number(a.favorite))
  } else {
    result = result.sort((a, b) => {
      const diff = new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
      return filtersSection.value.sort === 'asc' ? diff : -diff
    })
  }

  return result
})

const groupedMilestones = computed(() => {
  const formatter = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })
  const groups = filteredMilestones.value.reduce((acc, item) => {
    const label = formatter.format(new Date(item.occurredAt))
    if (!acc[label]) acc[label] = []
    acc[label].push(item)
    return acc
  }, {})

  return Object.entries(groups).map(([label, items]) => ({ label, items }))
})

const topCategory = computed(() => {
  if (!milestones.value.length) return ''
  const counts = milestones.value.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {})
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
})

const favoriteCount = computed(() => milestones.value.filter(item => item.favorite).length)

const formatRelative = (date) => {
  const diff = Math.abs(Date.now() - date.getTime())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mo ago`
  const years = Math.floor(months / 12)
  return `${years} yr ago`
}

const lastUpdated = computed(() => {
  if (!milestones.value.length) return 'Not yet'
  const newest = milestones.value
    .map(item => new Date(item.occurredAt).getTime())
    .sort((a, b) => b - a)[0]
  return formatRelative(new Date(newest))
})

const thisMonthCount = computed(() => {
  const now = new Date()
  return milestones.value.filter(item => {
    const d = new Date(item.occurredAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(fetchMilestones)
</script>


<style scoped>
.milestonesPage {
  max-width: 1600px;
  margin: 20px auto;
}

.milestonesHeroSection {
  align-items: start;
  background: linear-gradient(120deg, #f6f9ff 70%, #e5f7ff);
  border-radius: 12px;
  position: relative;
  padding-bottom: 20px;
}

.milestonesPage :deep(.button-group) {
  position: absolute;
  z-index: 5;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.8rem;
  padding: 2rem;
}

.closeElement.collapsed  {
  display: none;
}

.milestoneSectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  padding: 15px 20px;
  border-radius: 12px 12px 0px 0px;
  height: 74px;
  box-sizing: border-box;
  position: relative;
  z-index: 5;
}

.milestoneSectionHeader h1 {
  font-size: 1.5rem;
  margin: 0;
  color: white;
  font-weight: 700;
  text-align: center;
  flex: 1;
}

.milestoneInfo h1 {
  font-size: 2.6rem;
  margin: 0.25rem 0 0.75rem;
  background: linear-gradient(90deg, #4f9dff, #74ebd5, #ffb347);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 700px;
}

.lede {
  max-width: 620px;
  line-height: 1.6;
  color: #42506a;
  margin: 0 0 1.3rem 0;
}

.eyebrow {
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
  color: #7c8cab;
  font-size: 0.82rem;
}

.milestoneStats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.9rem;
}

.milestoneStatCard {
  background: #fff;
  border: 1px solid #e0e7ef;
  border-radius: 16px;
  padding: 1rem 1.2rem;
  box-shadow: 0 6px 24px rgba(79, 157, 255, 0.08);
}

.stat-label {
  color: #718199;
  font-size: 0.9rem;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #2e3a52;
}

.stat-sub {
  color: #9aa7be;
  font-size: 0.9rem;
}

.addMilestoneCard {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e1e8f5;
  box-shadow: 0 12px 36px rgba(79, 157, 255, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px 12px 0 0;
  margin: -20px -20px 15px -20px;
  padding: 0.8rem 1.2rem;
}

.card-header h3 {
  margin: 0.2rem 0 0;
  font-size: 1.4rem;
}

.pill {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: #eaf4ff;
  color: #2f6bff;
  font-weight: 700;
  font-size: 0.85rem;
}

.pill-soft {
  background: #f7f3ff;
  color: #7e62e0;
}

.quick-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 700;
  color: #41506a;
}

.field input,
.field textarea,
.field select {
  border: 1.5px solid #d4deef;
  border-radius: 12px;
  padding: 0.75rem 0.85rem;
  font-size: 1rem;
  background: #f8fbff;
  color: #41506a;
  transition: border 0.2s, box-shadow 0.2s;
}

.field input::placeholder,
.field textarea::placeholder {
  color: #a6b5cc;
}

.field input:focus,
.field textarea:focus,
.field select:focus {
  outline: none;
  border-color: #4f9dff;
  box-shadow: 0 0 0 3px rgba(79, 157, 255, 0.12);
}

.primary {
  border: none;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  padding: 0.9rem;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(79, 157, 255, 0.22);
}

.filtersSection {
  margin: 20px 0px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(79, 157, 255, 0.08);
  padding-bottom: 20px;
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.9rem;
  padding: 1rem 1.2rem;
  align-items: end;
}

.clearButton {
  padding: 12px 20px;
  background: white;
  color: #f44336;
  border: 1.4px solid #f4433680;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 1000;
  transition: all 0.2s;
  align-self: flex-end;
  transform: translate(0px, -5px);
}

.clearButton:hover {
    background: #ff004017;
    border: 1.4px solid #49070279;
    box-shadow: 0 2px 6px rgba(244, 67, 54, 0.39);
}

.ghost {
  border: 1.5px solid #d5dfef;
  background: #f8fbff;
  color: #3d4a63;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.timelineSection {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 36px rgba(79, 157, 255, 0.1);
  padding-bottom: 20px;
}
.empty {
  text-align: center;
  color: #6b7893;
  padding: 2rem 1rem;
}

.empty.error {
  color: #d14343;
}

.timelineSection-content {
  padding: 1rem;
}

.group-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #7a88a4;
  font-weight: 700;
}

.timelineSection-items {
  display: grid;
  gap: 0.8rem;
}

.timelineSection-card {
  border: 1px solid #e5ecf8;
  border-radius: 14px;
  padding: 1rem 1.1rem;
  background: linear-gradient(120deg, #ffffff, #f9fbff);
  box-shadow: 0 8px 22px rgba(79, 157, 255, 0.1);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.muted {
  color: #7a88a4;
  font-weight: 600;
  font-size: 0.95rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
}

.star {
  font-size: 1.2rem;
  color: #cbd5e1;
  transition: color 0.2s;
}

.star.active {
  color: #f5a524;
}

.timelineSection-card h3 {
  margin: 0.35rem 0 0.35rem;
  color: #1f2a3d;
}

.note {
  color: #4a566f;
  margin: 0 0 0.6rem 0;
  line-height: 1.5;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.6rem;
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  gap: 0.4rem;
}

.danger {
  border: 1.5px solid #f3c0c0;
  background: #fff2f2;
  color: #d14343;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
}

.insights {
  display: grid;
  gap: 1rem;
}

.panel {
  background: #fff;
  border: 1px solid #e2eaf5;
  border-radius: 12px;
  padding: 1rem 1.1rem;
  box-shadow: 0 10px 28px rgba(79, 157, 255, 0.09);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.stats-list {
  list-style: none;
  padding: 0;
  margin: 0.4rem 0 0;
  display: grid;
  gap: 0.7rem;
}

.stats-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem;
  border-radius: 12px;
  background: #f7f9ff;
}

.stat-large {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #1f2a3d;
}

@media (max-width: 1080px) {
  .milestonesHeroSection {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .milestonesPage {
    padding: 1rem;
  }

  .milestonesHeroSection {
    padding-bottom: 12px;
  }

  .milestoneSectionHeader {
    height: 64px;
    padding: 12px 14px;
  }

  .content-grid {
    padding: 1.25rem;
    gap: 1.25rem;
  }

  .milestoneInfo h1 {
    font-size: 2rem;
    white-space: normal;
    max-width: 100%;
  }

  .lede {
    font-size: 0.98rem;
  }

  .addMilestoneCard {
    padding: 16px;
  }

  .card-header {
    margin: -16px -16px 12px -16px;
  }

  .milestoneStats {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .filter-controls {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .row {
    grid-template-columns: 1fr;
  }

  .primary {
    width: 100%;
  }

  .timelineSection-card {
    padding: 0.9rem;
  }

  .card-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    width: 100%;
  }

  .action-buttons .ghost,
  .action-buttons .danger {
    flex: 1 1 0;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .milestoneSectionHeader h1 {
    font-size: 1.25rem;
  }

  .milestoneInfo h1 {
    font-size: 1.7rem;
  }

  .milestoneStatCard {
    padding: 0.85rem 1rem;
  }

  .card-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }

  .card-meta {
    flex-wrap: wrap;
  }
}
</style>
