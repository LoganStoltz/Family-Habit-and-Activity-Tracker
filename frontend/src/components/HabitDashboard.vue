<template>
  <div class="habits-page">
    <div class="page-header">
      <h2>{{ profile.firstName }}'s Habits & Care</h2>
    </div>

    <div class="habits-dashboard">
      <div class="dashboard-header">
        <h1>Habits & Care</h1>
        <div class="dashboard-actions">
          <button @click="showAddModal = 'custom'" class="dashboard-btn add-habit">+ Add Habit</button>
          <button @click="showAddModal = 'premade'" class="dashboard-btn premade-habit">+ Add Premade</button>
        </div>
      </div>

      <div class="dashboard-cards">
        <HabitCard
          v-for="habit in habits"
          :key="habit.id"
          :habit="habit"
          :logs="habitLogs[habit.id]"
          @delete="confirmDelete(habit)"
          @log="openLogModal(habit)"
        />
      </div>

      <AddHabitModal
        v-if="showAddModal"
        :isPremade="showAddModal === 'premade'"
        :loading="isAdding"
        :error="addError"
        @submit="handleAddHabit"
        @close="showAddModal = ''"
      />

      <ConfirmDeleteModal
        v-if="habitToDelete"
        :title="'Delete Habit?'"
        :message="`Are you sure you want to delete ${habitToDelete.name}?`"
        @confirm="deleteHabit(habitToDelete.id)"
        @cancel="habitToDelete = null"
      />

      <LogModalManager
        :habit="selectedHabit"
        v-if="selectedHabit"
        @submit-log="submitHabitLog"
        @close="selectedHabit = null"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHabits } from '../composables/useHabits'
import HabitCard from './HabitCard.vue'
import AddHabitModal from './AddHabitModal.vue'
import ConfirmDeleteModal from './ConfirmDeleteModal.vue'
import LogModalManager from './LogModalManager.vue'

const profile = JSON.parse(localStorage.getItem('profile') || '{}')
const user = JSON.parse(localStorage.getItem('user') || '{}')

const { habits, habitLogs, fetchHabits, addHabit, deleteHabit, addError, isAdding } =
  useHabits(user.id, profile.id)

const showAddModal = ref('')
const habitToDelete = ref(null)
const selectedHabit = ref(null)

const confirmDelete = (habit) => (habitToDelete.value = habit)

const handleAddHabit = async (habitData) => {
  await addHabit({ habit: { ...habitData, profile_id: profile.id } })
  showAddModal.value = ''
}

const openLogModal = (habit) => (selectedHabit.value = habit)

onMounted(fetchHabits)
</script>
