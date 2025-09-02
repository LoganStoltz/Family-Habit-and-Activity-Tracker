<template>
  <section class="login-main-section">
    <!-- Login Form -->
    <div class="login-form-section">
      <h1 class="title">Login</h1>

        <form class="login-form" @submit.prevent="submitForm">
            <div class="form-group">
                <label for="userName">UserName or Email</label>
                <input type="text" id="name" v-model="form.userName" required />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" v-model="form.password" required/>
            </div>

            <button type="submit" class="submit-button">Login</button>
        </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = reactive({
  userName: '',
  password: ''
});

const submitForm = async () => {
  try {
    // Send login request to backend
    const isEmail = form.userName.includes('@');
    const body = isEmail
      ? { email: form.userName, password: form.password }
      : { user_name: form.userName, password: form.password };

    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      // Invalid login
      const errorData = await response.json();
      alert('Login failed: ' + (errorData.error || 'Invalid credentials'));
      return;
    }

    // Successful login
    const data = await response.json();
    console.log('Login successful:', data);

    // Store user info in localStorage for global access
    localStorage.setItem('user', JSON.stringify(data.user || data));

    // Optionally store a token in localStorage/sessionStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    alert('Login successful!');

    // Redirect user to home page
    router.push('/');
  } catch (err) {
    console.error(err);
    alert('Something went wrong during login.');
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.login-main-section {
  font-family: 'Inter', sans-serif;
  background: rgb(52, 54, 77);
  min-height: 98vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  color: white;
  text-align: center;
  margin-bottom: 1.5rem;
}

/* Form */
.login-form-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 2rem;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.login-form {
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
