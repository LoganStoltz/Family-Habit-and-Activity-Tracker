<template>
  <div class="modal">
    <button class="modal-exit" type="button" @click="$emit('close')">&times;</button>
    <h2>Log Cleaning</h2>
    <form @submit.prevent="submitLog">
      <div class="modal-two-col-form">
        <label>Type:</label>
        <input type="text" v-model="type" placeholder="Type of cleaning">
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
const notes = ref('');
const type = ref('');
const emit = defineEmits(['log-submitted', 'close']);

function submitLog() {
  emit('log-submitted', {
    type: type.value,
    notes: notes.value
  });
}
</script>

<style src="../../assets/modal.css"></style>