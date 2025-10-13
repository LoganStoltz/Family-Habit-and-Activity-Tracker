<template>
  <div class="modal">
    <button class="modal-exit" type="button" @click="$emit('close')">&times;</button>
    <h2>Log Adult Hygine</h2>
    <form @submit.prevent="submitLog">
        <label>
        Type:
        <select v-model="type" required>
           <option value="" disabled>Select type</option>
           <option value="bath">Bath</option>
           <option value="shower">Shower</option>
        </select>
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
const notes = ref('');
const emit = defineEmits(['log-submitted', 'close']);

function submitLog() {
  emit('log-submitted', {
    type: type.value,
    notes: notes.value
  });
}
</script>

<style src="@/assets/log-modal.css" />