<template>
  <section class="HomePage-main-section">
    <div class="welcome-message">
      <h2>Hello {{ firstName }}, {{ lastName }}!</h2>
    </div>
    <div class="intro">
      <h1>Welcome to your Family Habit and Activity Tracker!</h1>
      <p>Track your family's habits and activities all in one place.</p>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      firstName: "",
      lastName: ""
    }
  },

  async mounted() {
    try {
      // Placeholder backend API fetch
      const response = await fetch("http://localhost:3000/api/user"); 
      const data = await response.json();
      this.firstName = data.firstName;
      this.lastName = data.lastName;
    } 
    catch (error) {
      console.error("Error fetching user:", error);
      this.userName = "Guest"; // fallback
    }
  }
}
</script>

<style>
</style>