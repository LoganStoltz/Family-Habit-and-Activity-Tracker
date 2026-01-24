<template>
  <div class="modal">
    <button class="modal-exit" type="button" @click="$emit('close')">&times;</button>
    <h2>Log Feeding</h2>
    <form @submit.prevent="submitLog">
      <label>
        Type:
        <select v-model="type" required>
           <option value="" disabled>Select type</option>
           <option value="breastMilk">Breast Milk</option>
           <option value="formula">Formula</option>
           <option value="solids">Solids</option>
        </select>
      </label>
      <label>
        Amount (oz):
        <input v-model.number="amount" type="number" min="0" step="0.5" required />
      </label>
      <label>
        Notes:
        <input type="text" v-model="notes" placeholder="Additional Notes" />
      </label>
      <button type="submit">Submit Log</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const type = ref('');
const amount = ref(0);
const notes = ref('');
const emit = defineEmits(['log-submitted', 'close']);

function submitLog() {
  emit('log-submitted', {
    type: type.value,
    amount: amount.value,
    notes: notes.value
  });
}
</script>

<style src="../../assets/modal.css"></style>