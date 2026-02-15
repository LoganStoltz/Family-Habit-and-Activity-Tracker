<template>
  <div class="modal-overlay">
    <div class="modal">
      <button class="modal-exit" @click="$emit('close')">&times;</button>
      <h2>Edit Habit</h2>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="modal-two-col-form">
          <label>Name</label>
          <input v-model="local.name" placeholder="Habit Name" required />
        </div>
        
        <div class="modal-two-col-form">
          <label>Description</label>
          <input v-model="local.description" placeholder="Description" />
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
  habit: { type: Object, required: true },
  apiBase: { type: String, default: API_BASE_URL }
})
const emits = defineEmits(['updated', 'close'])

const loading = ref(false)
const error = ref('')
const local = ref({ id: null, name: '', description: '' })

watch(
  () => props.habit,
  (h) => {
    if (h) {
      local.value.id = h.id ?? null
      local.value.name = h.name ?? ''
      local.value.description = h.description ?? ''
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  error.value = ''
  if (!local.value.id) {
    error.value = 'Invalid habit'
    return
  }

  loading.value = true
  try {
    const res = await fetch(`${props.apiBase}/habits/${local.value.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ habit: { name: local.value.name, description: local.value.description } })
    })

    if (!res.ok) {
      let msg = `Request failed: ${res.status}`
      try {
        const data = await res.json()
        if (data?.error) msg = data.error
        else if (data?.errors && Array.isArray(data.errors)) msg = data.errors.join(', ')
        else msg = JSON.stringify(data)
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
    emits('close')
  } catch (err) {
    console.error('EditHabitModal error:', err)
    error.value = err?.message || 'Failed to update habit.'
  } finally {
    loading.value = false
  }
}
</script>

<style src="../../assets/modal.css"></style>
