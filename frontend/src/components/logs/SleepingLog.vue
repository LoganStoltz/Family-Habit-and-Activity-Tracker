<template>
  <div class="modal">
    <button class="modal-exit" type="button" @click="$emit('close')">&times;</button>
    <h2>Log Sleep</h2>
    <form @submit.prevent="submitLog">
      <label>
        Amount of sleep in hours:
        <input v-model.number="amount" type="number" min="0" step="0.5" required />
      </label>
      <label>
        Went to bed by:
        <input v-model="bedtime" type="time" required />
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
const bedtime = ref('');
const notes = ref('');
const emit = defineEmits(['log-submitted', 'close']);

function submitLog() {
  emit('log-submitted', { 
    amount: amount.value,
    bedtime: bedtime.value,
    notes: notes.value
  });
}
</script>

<style src="../../assets/modal.css"></style>