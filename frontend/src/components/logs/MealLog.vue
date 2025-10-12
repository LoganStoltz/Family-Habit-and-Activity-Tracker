<template>
  <div class="modal">
    <button class="modal-exit" type="button" @click="$emit('close')">×</button>
    <h2>Log Meal</h2>
    <form @submit.prevent="submitLog">
        <label>
            Snack Or Meal:
            <select v-model="snackOrMeal" required>
            <option value="" disabled>Select type</option>
            <option value="snack">Snack</option>
            <option value="meal">Meal</option>
            </select>
        </label>
        <label>
            Calories:
            <input type="number" v-model="calories" placeholder="Calorie count" />
        </label>
        <label>
            Notes:
            <input type="text" v-model="notes" placeholder="Additional Notes" />
        </label>
        <button type="submit">Log Change</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const snackOrMeal = ref('');
const calories = ref('');
const notes = ref('');
const emit = defineEmits(['log-submitted', 'close']);

function submitLog() {
    emit('log-submitted', { 
        snackOrMeal: snackOrMeal.value,
        calories: calories.value,
        notes: notes.value
    });
}
</script>

<style src="@/assets/log-modal.css"></style>