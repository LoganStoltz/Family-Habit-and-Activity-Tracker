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
  --background-light: linear-gradient(to right, #ff0000, #384c6b);
  --background-blue: #6f8bbe77;
  --background-header: #1e425f;
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

  /* Shadows */
  --box-shadow-default: 0 12px 36px rgba(0, 0, 0, 0.25);
  --box-shadow-hover: 0 16px 40px rgba(0, 0, 0, 0.5);

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

/* Firefox */
* {
  scrollbar-width: 14px;
  scrollbar-color: #5f7f8c #12222c;
}

/* Global button styles */
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
