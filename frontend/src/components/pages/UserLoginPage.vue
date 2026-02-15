<template>
  <section class="login-main-section">
    <!-- Login Form -->
    <div class="login-form-section">
      <h1 class="title">Login</h1>

        <form class="login-form" @submit.prevent="submitForm">
            <div class="form-group">
                <label for="userName">Username or Email</label>
                <input type="text" id="name" v-model="form.userName" @input="loginError = false" :class="{ 'input-error': loginError }" required />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" v-model="form.password" @input="loginError = false" :class="{ 'input-error': loginError }" required/>
            </div>

            <button type="submit" class="submit-button">Login</button>
            <div class="registration-link">
              <p> Don't have an account? 
                <router-link to="/registration">Register here</router-link>
              </p>
              <p> Forgot your password? 
                <router-link to="/account-recovery">Reset here</router-link>
              </p>
            </div>
          </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { API_BASE_URL } from '../../config/api.js';

const router = useRouter();
const loginError = ref(false);

const form = reactive({
  userName: '',
  password: ''
});

const submitForm = async () => {
  try {
    const isEmail = form.userName.includes('@');
    const body = isEmail
      ? { email: form.userName, password: form.password }
      : { user_name: form.userName, password: form.password };

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      credentials: 'include', // needed if Rails sets cookies
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json(); // parse JSON once

    if (!response.ok) {
      loginError.value = true;
      alert('Login failed: ' + (data.error || 'Invalid credentials'));
      return;
    }

    console.log('Login successful:', data);
    localStorage.setItem('user', JSON.stringify(data.user || data));
    if (data.token) localStorage.setItem('authToken', data.token);

    window.dispatchEvent(new Event('storage')); // notify Header.vue
    router.push('/');

  } catch (err) {
    console.error(err);
    loginError.value = true;
    alert('Something went wrong during login.');
  }
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.login-main-section {
  font-family: 'Inter', sans-serif;
  background: var(--main-background-dark);
  min-height: calc(100vh - 4.5rem);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.login-main-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(79, 157, 255, 0.1) 0%, transparent 70%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

.title {
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.2rem;
  font-weight: 700;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

/* Form Container */
.login-form-section {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-large);
  padding: 3rem;
  width: 450px;
  max-width: 90%;
  box-shadow: var(--box-shadow-default);
  position: relative;
  z-index: 1;
  transition: all var(--transition-normal);
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form-section:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-hover);
  border-color: rgba(255, 255, 255, 0.15);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  position: relative;
}

.form-group label {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: block;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.form-group input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border-radius: var(--radius-medium);
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  transition: all var(--transition-normal);
  box-sizing: border-box;
  backdrop-filter: blur(10px);
}

.form-group input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.form-group input:focus {
  outline: none;
  border-color: #4f9dff;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(79, 157, 255, 0.1);
  transform: translateY(-2px);
}

.form-group input.input-error {
  border-color: rgba(230, 57, 70, 0.5) !important;
}

.form-group input.input-error:focus {
  border-color: rgba(230, 57, 70, 0.5) !important;
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1) !important;
}

.form-group input:invalid {
  border-color: rgba(230, 57, 70, 0.5);
}

.form-group input:valid {
  border-color: rgba(116, 235, 213, 0.5);
}

.registration-link {
  text-align: center;
  margin-top: 1rem;
}

.registration-link a {
  color: #4f9dff;
  font-weight: 600;
  text-decoration: none;
  transition: color var(--transition-normal);
}

.forget-password-link {
  text-align: center;
  margin-top: 1rem;
}

.forget-password-link a {
  color: #3a74bb;
  font-weight: 600;
  text-decoration: none;
  transition: color var(--transition-normal);
}

.submit-button {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: var(--radius-medium);
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
}

.submit-button:hover {
  background: linear-gradient(135deg, var(--accent-yellow), #ff9800);
  color: #1e3a5f;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 209, 102, 0.5);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .login-form-section {
    padding: 2rem;
    width: 100%;
    margin: 1rem;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .form-group input {
    padding: 0.875rem;
  }
  
  .submit-button {
    font-size: 1.1rem;
    padding: 0.875rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .login-main-section {
    padding: 1rem;
  }
  
  .title {
    font-size: 1.6rem;
  }
}</style>
