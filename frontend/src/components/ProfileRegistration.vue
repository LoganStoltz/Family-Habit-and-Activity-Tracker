<template>
  <div>
      <h1 class="title">Register</h1>

      <form class="registration-form" @submit.prevent="submitForm">
          <div class="form-group">
              <label for="firstName">First Name</label>
              <input type="text" id="firstName" v-model="form.firstName" required />
          </div>

          <div class="form-group">
              <label for="lastName">Last Name</label>
              <input type="text" id="lastName" v-model="form.lastName" required />
          </div>

          <div class="form-group">
              <label for="dob">Date of Birth</label>
              <input type="date" id="dob" v-model="form.dob" required />
          </div>
          <div class="form-group">
              <label for="type">Baby or Adult</label>
              <input type="text" id="type" v-model="form.type" required />
          </div>

          <button type="submit" class="submit-button">Register</button>
      </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const form = reactive({
    firstName: "",
    lastName: "",
    dob: "",
    type: ""
});

async function submitForm() {
    try {
        const response = await fetch("http://localhost:3000/profiles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userID: localStorage.getItem('userID'),
                profiles: {
                    first_name: form.firstName,
                    last_name: form.lastName,
                    dob: form.dob,
                    type: form.type
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert("Failed to register profile: " + errorData.errors.join(", "));
            return;
        }

         const data = await response.json();
         console.log("Profile created:", data);
        alert("Profile registered successfully!");
    } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
    }
}
</script>

<style>

</style>