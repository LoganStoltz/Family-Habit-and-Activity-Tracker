<template>
  <section class="registration-main">
    <div class="registration-form-container">
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
          <label for="userName">User Name</label>
          <input type="text" id="userName" v-model="form.userName" required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="form.email" required />
        </div>

        <div class="form-group">
          <label for="phoneNumber">Phone Number</label>
          <input type="tel" id="phoneNumber" v-model="form.phoneNumber" />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="form.password" required />
        </div>

        <div class="form-group">
          <label for="rePassword">Confirm Password</label>
          <input type="password" id="rePassword" v-model="form.rePassword" required />
        </div>

        <button type="submit" class="submit-button">Register</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const form = reactive({
  firstName: "",
  lastName: "",
  userName: "",
  email: "",
  phoneNumber: "",
  password: "",
  rePassword: ""
});

async function submitForm() {
  if (form.password !== form.rePassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          first_name: form.firstName,
          last_name: form.lastName,
          user_name: form.userName,
          email: form.email,
          phone_number: form.phoneNumber,
          password: form.password
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert("Error: " + errorData.errors.join(", "));
      return;
    }

    const data = await response.json();
    console.log("User created:", data);
    alert("Registration successful!");
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.registration-main {
  font-family: 'Inter', sans-serif;
  background: rgb(52, 54, 77);
  min-height: 98vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.registration-form-container {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 2rem;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.title {
  color: white;
  text-align: center;
  margin-bottom: 1.5rem;
}

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group label {
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
  display: block;
}

.form-group input {
  width: 93%;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 2px solid #ccc;
  background: #2f314b;
  color: white;
}

.form-group input:focus {
  outline: none;
  border-color: #4f9dff;
}

.submit-button {
  background-color: #4f9dff;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 2rem;
}

.submit-button:hover {
  background-color: #ffd95c;
  color: #2f314b;
}
</style>
