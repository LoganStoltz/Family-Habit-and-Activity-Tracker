<template>
  <div class="modal-overlay">
    <div class="modal">
      <button class="modal-undo" @click="$emit('undo')">&lsaquo;</button>
      <button class="modal-exit" @click="$emit('close')">&times;</button>
      <h2>{{ isPremade ? 'Add Premade Habit' : 'Add Custom Habit' }}</h2>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <select v-if="isPremade" v-model="habitType" required>
          <option disabled value="">Select Type</option>
          <option v-for="(opt, key) in premadeHabitOptions" :key="key" :value="key">
            {{ opt.label }}
          </option>
        </select>

        <input v-model="habit.name" placeholder="Habit Name" required />
        <input v-model="habit.description" placeholder="Description" />

        <div v-if="error" class="modal-error">{{ error }}</div>

        <div class="modal-actions">
          <button type="submit" class="modal-add" :disabled="loading">
            {{ loading ? 'Adding...' : 'Add Habit' }}
          </button>
          <button type="button" class="modal-cancel" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { API_BASE_URL } from '../../config/api.js'
const props = defineProps({
  isPremade: Boolean,
  userId: [String, Number],
  profileId: [String, Number],
  apiBase: { type: String, default: API_BASE_URL }
})
const emits = defineEmits(['added', 'close', 'undo'])

const habitType = ref('')
const habit = ref({ name: '', description: '' })
const loading = ref(false)
const error = ref('')

const premadeHabitOptions = {
  adultBath: { label: 'Adult Hygiene', category: 'adultBath' },
  babyBath: { label: 'Baby Bath', category: 'babyBath' },
  cleaning: { label: 'Cleaning', category: 'cleaning' },
  exercise: { label: 'Exercise', category: 'exercise' },
  diaper: { label: 'Diaper Change', category: 'diaper' },
  drinkWater: { label: 'Drinking Water', category: 'drinkingWater' },
  babyFeed: { label: 'Baby Feeding', category: 'babyFeed' },
  meals: { label: 'Meals', category: 'meals' },
  meditation: { label: 'Meditation', category: 'meditation' },
  reading: { label: 'Reading', category: 'reading' },
  sleeping: { label: 'Sleeping', category: 'sleeping' }
}

const handleSubmit = async () => {
  error.value = ''
  // validate premade selection
  if (props.isPremade && !habitType.value) {
    error.value = 'Please select a premade habit type.'
    return
  }
  const category = props.isPremade ? premadeHabitOptions[habitType.value].category : 'custom'
  const payload = {
    habit: {
      profile_id: props.profileId,
      name: habit.value.name,
      description: habit.value.description,
      category
    }
  }

  loading.value = true
  try {
    const res = await fetch(`${props.apiBase}/users/${props.userId}/profiles/${props.profileId}/habits`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      let msg = `Request failed: ${res.status}`
      try {
        const data = await res.json()
        if (data?.error) msg = data.error
        else if (data?.errors && Array.isArray(data.errors)) msg = data.errors.join(', ')
        else msg = JSON.stringify(data)
      } catch (e) {
        const text = await res.text().catch(() => '')
        if (text) msg = text
      }
      error.value = msg
      return
    }

    // parse created habit (if JSON)
    let created = null
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      created = await res.json()
    } else {
      created = await res.text()
    }

    // reset form and notify parent
    habitType.value = ''
    habit.value = { name: '', description: '' }
    emits('added', created)
    emits('close')
  } catch (err) {
    console.error('AddHabitModal error:', err)
    error.value = err.message || 'Failed to add habit.'
  } finally {
    loading.value = false
  }
}
</script>

<style src="../../assets/modal.css"></style>
