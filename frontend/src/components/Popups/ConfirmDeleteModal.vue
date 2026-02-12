<template>
  <div class="modal-overlay" @click="onCancel">
    <div class="confirmation-modal" @click.stop>
      <h3>{{ title }}</h3>
      <p v-if="message" v-html="message"></p>
      <p v-if="warning" class="warning">{{ warning }}</p>
      <div class="modal-actions">
        <button class="cancel-btn" @click="onCancel">{{ cancelText }}</button>
        <button class="confirm-delete-btn" @click="onConfirm" :disabled="loading">
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  title: { type: String, default: 'Delete?' },
  message: { type: String, default: '' },
  warning: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  confirmText: { type: String, default: 'Yes, Delete' },
  cancelText: { type: String, default: 'Cancel' },
  loadingText: { type: String, default: 'Deleting...' }
});

const emit = defineEmits(['confirm', 'cancel']);

function onConfirm() {
  emit('confirm');
}
function onCancel() {
  emit('cancel');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.confirmation-modal {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  backdrop-filter: blur(20px);
  box-shadow: 0 12px 40px rgba(30,41,59,0.25);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.confirmation-modal h3 {
  color: #ff6b6b;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.confirmation-modal p {
  color: #f3f3f3;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.warning {
  color: #ff6b6b !important;
  font-weight: 600;
  margin-bottom: 2rem !important;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #f3f3f3;
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.confirm-delete-btn {
  background: linear-gradient(135deg, #e63946, #dc2626);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);
}

.confirm-delete-btn:hover:enabled {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(230, 57, 70, 0.5);
}

.confirm-delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .confirmation-modal {
    padding: 2rem;
    margin: 1rem;
  }
  .modal-actions {
    flex-direction: column;
  }
  .cancel-btn, .confirm-delete-btn {
    width: 100%;
  }
}
</style>