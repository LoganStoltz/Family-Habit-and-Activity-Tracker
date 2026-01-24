<template>
  <div class="modal">
    <button class="modal-exit" @click="$emit('close')">&times;</button>
    <h2>Log Reading</h2>
    <form @submit.prevent="submitLog">
      <label>
          Number of Pages Read:
          <input type="number" v-model.number="pagesRead" min="0" step="1" required />
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
const pagesRead = ref(0);
const notes = ref('');
const emit = defineEmits(['log-submitted', 'close']);

function submitLog() {
  emit('log-submitted', { 
    duration: pagesRead.value,
    notes: notes.value
  });
}
</script>

<style src="../../assets/modal.css"></style>
