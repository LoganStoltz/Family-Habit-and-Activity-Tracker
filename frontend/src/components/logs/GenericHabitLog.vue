<template>
  <div class="modal">
    <button class="modal-exit" type="button" @click="$emit('close')">×</button>
    <h2>Log Habit</h2>
    <form @submit.prevent="submitLog">
      <label>
        Notes:
        <input v-model="notes" placeholder="Optional notes" />
      </label>
      <button type="submit">Log</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const notes = ref('');
const emit = defineEmits(['log-submitted']);

function submitLog() {
  emit('log-submitted', { notes: notes.value });
}
</script>

<style scoped>
 .modal {
   background: #fff;
   border-radius: 18px;
   box-shadow: 0 8px 32px rgba(79,157,255,0.22);
   padding: 2.5rem 2rem;
   min-width: 340px;
   max-width: 95vw;
   position: relative;
   color: #222;
 }
 .modal-exit {
   position: absolute;
   top: 1rem;
   right: 1rem;
   background: none;
   border: none;
   font-size: 2rem;
   color: #4f9dff;
   cursor: pointer;
   font-weight: bold;
   z-index: 10;
 }
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
 label {
   font-weight: 700;
   color: #2d3a4a;
   margin-bottom: 0.3rem;
 }
 input {
   padding: 0.7rem;
   border-radius: 8px;
   border: 1.5px solid #b3c2d6;
   font-size: 1rem;
   background: #f6fafd;
   color: #222;
 }
 button {
   background: linear-gradient(135deg, #4f9dff, #74ebd5);
   color: #fff;
   border: none;
   font-weight: 700;
   border-radius: 10px;
   padding: 0.7rem 1.5rem;
   cursor: pointer;
   box-shadow: 0 2px 8px rgba(79,157,255,0.10);
 }
</style>
