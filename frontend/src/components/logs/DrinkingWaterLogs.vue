<template>
  <div class="modal">
    <button class="modal-exit" @click="$emit('close')">&times;</button>
    <h2>Log Drink of Water</h2>
    <form @submit.prevent="submitLog">
      <label>
          Amount (oz):
          <input type="number" v-model.number="amount" min="0" step="0.5" required />
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
const amount = ref(0);
const notes = ref('');
const emit = defineEmits(['log-submitted', 'close']);

function submitLog() {
  emit('log-submitted', {
    amount: amount.value,
    notes: notes.value
  });
}
</script>

<style src="@/assets/log-modal.css"></style>