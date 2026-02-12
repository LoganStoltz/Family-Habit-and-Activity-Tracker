<template>
  <div class="button-group">
    <button 
      v-if="showCollapse"
      class="collapse-toggle" 
      @click="toggleCollapse"
      :class="{ collapsed: isCollapsed }"
      :title="isCollapsed ? 'Expand' : 'Collapse'"
    >
      <span class="collapse-icon">{{ isCollapsed ? '▼' : '▲' }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  showCollapse: { type: Boolean, default: false },
  showClose: { type: Boolean, default: true }
});

const isCollapsed = ref(false);
const emit = defineEmits(['minimize', 'toggle']);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('toggle', isCollapsed.value);
};
</script>

<style scoped>
.button-group {
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 0;
}

.collapse-toggle,
.close-toggle {
  position: relative;
  top: 13px;
  right: 12px;
  width: 40px;
  height: 50px;
  border: none;
  border-radius: 8px 0px 0px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.collapse-toggle {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
}

.collapse-toggle:hover {
  width: 80px;
  background: linear-gradient(135deg, #74ebd5, #4f9dff);
  box-shadow: 2px 0 12px rgba(79, 157, 255, 0.3);
  transform: translateX(-40px) !important;
}

.close-toggle {
  background: linear-gradient(135deg, #e63946, #dc2626);
}

.close-toggle:hover {
  width: 32px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  box-shadow: 2px 0 12px rgba(230, 57, 70, 0.3);
}


.collapse-icon,
.close-icon {
  color: white;
  font-size: 25px;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.close-icon {
  font-size: 24px;
  line-height: 1;
}

.collapse-toggle:hover .collapse-icon {
  transform: translateX(-10px);
}
</style>