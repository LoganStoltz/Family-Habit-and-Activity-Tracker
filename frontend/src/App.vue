<template>
  <div id="app">
    <Header />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue';
</script>

<style>
:root {
  /* Typography */
  --font-family-base: 'Inter', sans-serif;

  /* Colors - Backgrounds */
  --main-background-dark: linear-gradient(to right, #0f2027, #203a43, #2c5364);
  --background-light: linear-gradient(to right, #5a7480, #384c6b);
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
  --heading-gradient: linear-gradient(to right, #74ebd5, #e3caff);

  /* Shadows */
  --box-shadow-default: 0 12px 36px rgba(0, 0, 0, 0.25);
  --box-shadow-hover: 0 16px 40px rgba(0, 0, 0, 0.5);

  /* Border radius */
  --radius-large: 16px;
}
</style>
