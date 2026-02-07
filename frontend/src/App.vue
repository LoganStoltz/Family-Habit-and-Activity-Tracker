<template>
  <div id="app">
    <Header />
    <router-view />
  </div>
</template> 

<script setup lang="ts">
import Header from './components/elements/Header.vue';
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

:root {
  /* Typography */
  --font-family-base: 'Inter', sans-serif;

  /* Colors - Backgrounds */
  --main-background-dark: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  --display-panel-background: linear-gradient(to right, #ff0000, #384c6b);
  --interactable-panel-background: linear-gradient(to right, #ff0000, #384c6b);
  --main-header-background: linear-gradient(to right, #ff0000, #384c6b);
  --section-header-blue: #6f8bbe77;
  --dropdown-nav: #1a3b53;

  /* Colors - Text */
  --text-primary: #f4f4f4;
  --text-secondary: #d0d8e4;
  --text-dark: #e3caff;
  --text-dark-on-light: #ccd8e2;
  --text-muted: #c7c7c7;
  --text-black: #000000;

  /* Colors - Accent & Brand */
  --accent-blue: hsl(146, 100%, 93%);
  --accent-yellow: #ffd166;
  --heading-gradient: linear-gradient(135deg, #74ebd5, #e3caff);

  /* Border radius */
  --radius-large: 16px;
  --radius-medium: 12px;
  --radius-small: 8px;

  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family-base);
  background: var(--main-background-dark);
  color: var(--text-primary);
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}

/* Generic Global Button Styles */
.btn {
  font-family: var(--font-family-base);
  font-weight: 600;
  border: none;
  border-radius: var(--radius-medium);
  cursor: pointer;
  transition: var(--transition-normal);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Activity Button */
.activityButton {
  background: rgba(255, 255, 255, 0.95);
  color: #4f9dff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-weight: 700;
  font-size: 1.08rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-medium);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
}

.activityButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 157, 255, 0.35);
    filter: brightness(1.08);
}

.activityButton:active {
    transform: translateY(0px);
    box-shadow: 0 2px 8px rgba(79, 157, 255, 0.18);
}


/* ✏️ Editing Mode Button */
.editingModeButton {
  font-size: 1.5rem;
  transition: var(--transition-normal);
  cursor: pointer;
  padding: 0.7rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
}

.editingModeButton:hover {
  background: rgba(0, 0, 0, 0.2);
}

.editingModeButton.active {
  background: rgba(0, 0, 0, 0.3);
}

.editingModeButton.active:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 14px;
}

::-webkit-scrollbar-track {
  background: #12222c;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #5f7f8c, #3a5564);
  border-radius: 8px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #7f9aa8, #476b7d);
}

* {
  scrollbar-width: 14px;
  scrollbar-color: #5f7f8c #12222c;
}

/* Loading animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Responsive utilities */
@media (max-width: 1200px) {
  :root {
    --box-shadow-default: 0 8px 24px rgba(0, 0, 0, 0.2);
    --box-shadow-hover: 0 12px 32px rgba(0, 0, 0, 0.4);
  }
}

@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}
</style>
