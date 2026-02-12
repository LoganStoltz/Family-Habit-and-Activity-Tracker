<template>
  <div class="modal">
    <button class="modal-exit" type="button" @click="$emit('close')">&times;</button>
    <h2>Log Meal</h2>
    <form @submit.prevent="submitLog">
      <div class="modal-two-col-form">
        <label>Snack Or Meal:</label>
        <select v-model="snackOrMeal" required>
          <option value="" disabled>Select type</option>
          <option value="snack">Snack</option>
          <option value="meal">Meal</option>
        </select>
      </div>
      <div class="modal-two-col-form">
        <label>Calories:</label>
        <input type="number" v-model="calories" placeholder="Calorie count" />
      </div>
      <div class="modal-two-col-form">
        <label>Notes:</label>
        <input type="text" v-model="notes" placeholder="Additional Notes" />
      </div>
      <button type="submit">Submit Log</button>
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

<style src="../../assets/modal.css"></style>