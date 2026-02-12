<template>
  <div class="modal">
    <button class="modal-exit" type="button" @click="$emit('close')">&times;</button>
    <h2>Log Baby Bath</h2>
    <form @submit.prevent="submitLog">
      <div class="modal-two-col-form">
        <label>Lotion Applied:</label>
        <input type="checkbox" v-model="lotionApplied" />
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
const lotionApplied = ref('');
const notes = ref('');
const emit = defineEmits(['log-submitted', 'close']);

function submitLog() {
  emit('log-submitted', {
    lotionApplied: lotionApplied.value,
    notes: notes.value
  });
}
</script>

<style src="../../assets/modal.css"></style>