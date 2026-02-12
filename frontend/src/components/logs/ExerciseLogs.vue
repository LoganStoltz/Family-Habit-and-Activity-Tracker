<template>
  <div class="modal">
    <button class="modal-exit" @click="$emit('close')">&times;</button>
    <h2>Log Exercise</h2>
    <form @submit.prevent="submitLog">
      <div class="modal-two-col-form">
        <label>Duration (minutes):</label>
        <input type="number" v-model.number="duration" min="0" step="1" required />
      </div>
      <div class="modal-two-col-form">
        <label>Type:</label>
        <select v-model="type" required>
           <option value="" disabled>Select type</option>
           <option value="cardio">Cardio</option>
           <option value="strength">Strength</option>
           <option value="flexibility">Flexibility</option>
           <option value="balance">Balance</option>
        </select>
      </div>
      <div class="modal-two-col-form">
        <label>Warmup:</label>
        <input type="checkbox" v-model="warmup" />
      </div>
      <div class="modal-two-col-form">
        <label>CoolDown:</label>
        <input type="checkbox" v-model="cooldown" />
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
const duration = ref(0);
const type = ref('');
const warmup = ref(false);
const cooldown = ref(false);
const notes = ref('');
const emit = defineEmits(['log-submitted', 'close']);

function submitLog() {
  emit('log-submitted', {
    duration: duration.value,
    type: type.value,
    warmup: warmup.value,
    cooldown: cooldown.value,
    notes: notes.value
  });
}
</script>

<style src="../../assets/modal.css"></style>
