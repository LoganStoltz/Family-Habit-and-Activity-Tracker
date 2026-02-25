<template>
  <div class="modal-overlay">
    <div class="modal">
      <button class="modal-exit" @click="$emit('close')">&times;</button>
      <h2>Edit Habit Log</h2>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="modal-two-col-form">
          <label>Log Date</label>
          <input v-model="local.log_date" type="date" required />
        </div>

        <div class="modal-two-col-form">
          <label>Notes</label>
          <textarea v-model="local.notes" rows="4" placeholder="Update notes" />
        </div>

        <div v-if="error" class="modal-error">{{ error }}</div>

        <div class="modal-actions">
          <button type="submit" class="modal-add" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" class="modal-cancel" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { API_BASE_URL } from '@/config/api'

const props = defineProps({
  log: { type: Object, required: true },
  apiBase: { type: String, default: API_BASE_URL }
})

const emits = defineEmits(['updated', 'close', 'save'])

const loading = ref(false)
const error = ref('')
const local = ref({ id: null, habit_id: null, notes: '', log_date: '' })

const toYmd = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

watch(
  () => props.log,
  (log) => {
    if (log) {
      local.value.id = log.id ?? null
      local.value.habit_id = log.habit_id ?? null
      local.value.notes = log.notes ?? ''
      local.value.log_date = toYmd(log.log_date || log.created_at)
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  error.value = ''

  if (!local.value.id || !local.value.habit_id) {
    error.value = 'Invalid log'
    return
  }

  loading.value = true
  try {
    const res = await fetch(`${props.apiBase}/habits/${local.value.habit_id}/habit_logs/${local.value.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        habit_log: {
          notes: local.value.notes,
          log_date: local.value.log_date
        }
      })
    })

    if (!res.ok) {
      let msg = `Request failed: ${res.status}`
      try {
        const data = await res.json()
        if (data?.error) msg = data.error
        else if (data?.errors && Array.isArray(data.errors)) msg = data.errors.join(', ')
      } catch {
        const text = await res.text().catch(() => '')
        if (text) msg = text
      }
      error.value = msg
      return
    }

    const ct = res.headers.get('content-type') || ''
    const updated = ct.includes('application/json') ? await res.json() : await res.text()
    emits('updated', updated)
    emits('save', updated)
    emits('close')
  } catch (err) {
    console.error('EditHabitLogModal error:', err)
    error.value = err?.message || 'Failed to update log.'
  } finally {
    loading.value = false
  }
}
</script>

<style src="../../assets/modal.css"></style>
