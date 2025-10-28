<template>
  <div class="modal-overlay">
    <div class="modal">
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
const props = defineProps({ isPremade: Boolean, error: String, loading: Boolean })
const emits = defineEmits(['submit', 'close'])

const habitType = ref('')
const habit = ref({ name: '', description: '' })

const premadeHabitOptions = {
  adultBath: { label: 'Adult Hygiene', category: 'adultBath' },
  babyBath: { label: 'Baby Bath', category: 'babyBath' },
  cleaning: { label: 'Cleaning', category: 'cleaning' },
  exercise: { label: 'Exercise', category: 'exercise' },
  diaper: { label: 'Diaper Change', category: 'diaper' }
}

const handleSubmit = () => {
  emits('submit', {
    name: habit.value.name,
    description: habit.value.description,
    category: props.isPremade
      ? premadeHabitOptions[habitType.value].category
      : 'custom'
  })
  habitType.value = ''
  habit.value = { name: '', description: '' }
}
</script>
