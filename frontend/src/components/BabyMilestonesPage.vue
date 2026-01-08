<template>
  <div class="milestonesPage">
    <h1>Baby Milestones Page</h1>

    <div class="milestonesContent">
      <section class="milestonesButtonSection">
        <router-link class="activityButton" to="/activity-main">View Logs</router-link>
      </section>
      
      <section class="milestonesHeroSection">
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
      </section>

      <section class="filtersSection">
        <div class="filter-controls">
          <label class="field">
            <span>Search</span>
            <input v-model.trim="filtersSection.search" type="text" placeholder="Find a milestone" />
          </label>
          <label class="field">
            <span>Category</span>
            <select v-model="filtersSection.category">
              <option value="">All</option>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
          </label>
          <label class="field">
            <span>Time range</span>
            <select v-model="filtersSection.range">
              <option value="all">All time</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </label>
          <label class="field">
            <span>Sort</span>
            <select v-model="filtersSection.sort">
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
              <option value="favorite">Starred first</option>
            </select>
          </label>
          <button class="clearButton" type="button" @click="resetfiltersSection">Clear</button>
        </div>
      </section>

      <section class="timelineSection">
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
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '@/config/api'

const user = JSON.parse(localStorage.getItem('user') || '{}')
const profile = JSON.parse(localStorage.getItem('profile') || '{}')
const userId = user?.id
const profileId = profile?.id
const profileName = profile?.firstName || 'your little one'

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

const ideaList = [
  'First rollover or crawl',
  'First clear word or babble',
  'Met a new friend or relative',
  'Tried a new food',
  'Slept through the night',
  'Pulled up to stand or balanced'
]

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
    const response = await apiRequest(`/users/${userId}/profiles/${profileId}/milestones`)
    if (!response.ok) {
      throw new Error('Failed to load milestones')
    }
    const data = await response.json()
    milestones.value = Array.isArray(data) ? data.map(normalizeMilestone) : []
  } catch (err) {
    error.value = err.message || 'Could not load milestones'
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
    const response = await apiRequest(`/users/${userId}/profiles/${profileId}/milestones`, {
      method: 'POST',
      body: JSON.stringify({ milestone: payload })
    })
    if (!response.ok) {
      throw new Error('Could not save milestone')
    }
    const created = await response.json()
    milestones.value = [ normalizeMilestone(created), ...milestones.value ]
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
    error.value = err.message || 'Could not save milestone'
  }
}

const deleteMilestone = async (id) => {
  const previous = [ ...milestones.value ]
  milestones.value = milestones.value.filter(item => item.id !== id)
  try {
    const response = await apiRequest(`/milestones/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Delete failed')
  } catch (err) {
    milestones.value = previous
    error.value = err.message || 'Could not delete milestone'
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
    const response = await apiRequest(`/users/${userId}/profiles/${profileId}/milestones`, {
      method: 'POST',
      body: JSON.stringify({ milestone: payload })
    })
    if (!response.ok) throw new Error('Could not duplicate milestone')
    const created = await response.json()
    milestones.value = [ normalizeMilestone(created), ...milestones.value ]
  } catch (err) {
    error.value = err.message || 'Could not duplicate milestone'
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
    const response = await apiRequest(`/milestones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ milestone: { favorite: updated.favorite } })
    })
    if (!response.ok) throw new Error('Could not update favorite')
  } catch (err) {
    milestones.value = [
      ...milestones.value.slice(0, idx),
      previous,
      ...milestones.value.slice(idx + 1)
    ]
    error.value = err.message || 'Could not update favorite'
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

const categoryCount = (category) => {
  if (!category) return 0
  return milestones.value.filter(item => item.category === category).length
}

const favoriteCount = computed(() => milestones.value.filter(item => item.favorite).length)

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

const recentTags = computed(() => {
  const tags = new Set()
  milestones.value.slice(0, 10).forEach(item => item.tags.forEach(tag => tags.add(tag)))
  return Array.from(tags).slice(0, 8)
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

const formatRelative = (date) => {
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mo ago`
  const years = Math.floor(months / 12)
  return `${years} yr ago`
}

onMounted(fetchMilestones)
</script>

<style scoped>
.milestonesPage {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.milestonesButtonSection {
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

.milestonesHeroSection {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 1.8rem;
  align-items: start;
  background: linear-gradient(120deg, #f6f9ff 70%, #e5f7ff);
  border: 1.5px solid #dbe7ff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 16px 60px rgba(79, 157, 255, 0.12);
}

.milestoneInfo h1 {
  font-size: 2.6rem;
  margin: 0.25rem 0 0.75rem;
  background: linear-gradient(90deg, #4f9dff, #74ebd5, #ffb347);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  transition: border 0.2s, box-shadow 0.2s;
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
  border: 1px solid #e3eaf5;
  border-radius: 12px;
  padding: 1rem 1.2rem;
  box-shadow: 0 10px 30px rgba(79, 157, 255, 0.08);
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.9rem;
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
  border: 1px solid #e2eaf5;
  border-radius: 12px;
  padding: 1.2rem;
  box-shadow: 0 12px 36px rgba(79, 157, 255, 0.1);
}

.empty {
  text-align: center;
  color: #6b7893;
  padding: 2rem 1rem;
}

.empty.error {
  color: #d14343;
}

.timelineSection-group + .timelineSection-group {
  margin-top: 1rem;
}

.group-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.2rem 0.4rem;
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
    padding: 1.25rem;
  }

  .milestoneStats {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .filter-controls {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}
</style>
