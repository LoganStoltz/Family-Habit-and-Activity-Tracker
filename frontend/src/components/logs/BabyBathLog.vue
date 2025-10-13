<template>
  <div class="modal">
    <button class="modal-exit" type="button" @click="$emit('close')">&times;</button>
    <h2>Log Baby Bath</h2>
    <form @submit.prevent="submitLog">
      <label>
          Lotion Applied:
          <input type="checkbox" v-model="lotionApplied" />
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

<style src="@/assets/log-modal.css" />