<template>
  <div class="modal">
    <button class="modal-exit" type="button" @click="$emit('close')">&times;</button>
    <h2>Log Diaper Change</h2>
    <form @submit.prevent="submitLog">
      <div class="modal-two-col-form">
        <label>Type:</label>
        <select v-model="changeType" required>
          <option value="" disabled>Select type</option>
          <option value="wet">Wet</option>
          <option value="dirty">Dirty</option>
          <option value="both">Both</option>
        </select>
      </div>
      <div class="modal-two-col-form">
        <label>Notes:</label>
        <input v-model="notes" placeholder="Additional notes" />
      </div>
      <button type="submit">Submit Log</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const changeType = ref('');
const notes = ref('');
const emit = defineEmits(['log-submitted', 'close']);

function submitLog() {
  emit('log-submitted', {
    change_type: changeType.value,
    notes: notes.value
  });
}
</script>

<style src="../../assets/modal.css"></style>

