<template>
  <div class="modal">
    <button class="modal-exit" type="button" @click="$emit('close')">&times;</button>
    <h2>Log Cleaning</h2>
    <form @submit.prevent="submitLog">
      <label>
        Type:
        <input type="text" v-model="type" placeholder="Type of cleaning">
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