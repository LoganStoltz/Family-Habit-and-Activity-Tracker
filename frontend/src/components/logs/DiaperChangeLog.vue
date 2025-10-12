<template>
  <div class="modal">
    <button class="modal-exit" type="button" @click="$emit('close')">×</button>
    <h2>Log Diaper Change</h2>
    <form @submit.prevent="submitLog">
      <label>
        Type:
        <select v-model="changeType" required>
          <option value="" disabled>Select type</option>
          <option value="wet">Wet</option>
          <option value="dirty">Dirty</option>
          <option value="both">Both</option>
        </select>
      </label>
      <label>
        Notes:
        <input v-model="notes" placeholder="Additional notes" />
      </label>
      <button type="submit">Log Change</button>
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

<style src="@/assets/log-modal.css"></style>

