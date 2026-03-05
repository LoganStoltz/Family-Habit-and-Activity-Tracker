<template>
  <section class="registration-main">
    <div class="registration-form-container">
      <h1 class="title">Register</h1>

      <div
        v-if="registrationNotification"
        class="registration-notification"
        :class="`registration-notification--${registrationNotification.type}`"
        role="status"
        aria-live="polite"
      >
        {{ registrationNotification.message }}
      </div>

      <form class="registration-form" @submit.prevent="submitForm" @input="handleFieldInput">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input placeholder="REQUIRED" type="text" id="firstName" v-model="form.firstName" required />
        </div>

        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input placeholder="REQUIRED" type="text" id="lastName" v-model="form.lastName" required />
        </div>

        <div class="form-group">
          <label for="userName">User Name</label>
          <input placeholder="REQUIRED" type="text" id="userName" v-model="form.userName" required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input placeholder="REQUIRED" type="email" id="email" v-model="form.email" required />
        </div>

        <div class="form-group">
          <label for="phoneNumber">Phone Number</label>
          <input placeholder="OPTIONAL" type="tel" id="phoneNumber" v-model="form.phoneNumber" />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input placeholder="REQUIRED" type="password" id="password" v-model="form.password" required />
        </div>

        <div class="form-group">
          <label for="rePassword">Confirm Password</label>
          <input placeholder="REQUIRED" type="password" id="rePassword" v-model="form.rePassword" required />
        </div>

        <button type="submit" class="submit-button" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating account...' : 'Register' }}
        </button>
        <div class="login-link">
              <p> Already have an account? 
                <router-link to="/login">Login here</router-link>
              </p>
            </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { onBeforeUnmount, reactive, ref } from "vue";
import { API_BASE_URL } from '../../config/api.js';
  
const router = useRouter();
const isSubmitting = ref(false);
const registrationNotification = ref<{ type: 'success' | 'error'; message: string } | null>(null);
let notificationTimeout: ReturnType<typeof setTimeout> | null = null;
let redirectTimeout: ReturnType<typeof setTimeout> | null = null;

const form = reactive({
  firstName: "",
  lastName: "",
  userName: "",
  email: "",
  phoneNumber: "",
  password: "",
  rePassword: ""
});

const setRegistrationNotification = (type: 'success' | 'error', message: string) => {
  registrationNotification.value = { type, message };

  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  if (type === 'error') {
    notificationTimeout = setTimeout(() => {
      registrationNotification.value = null;
      notificationTimeout = null;
    }, 5000);
  }
};

const handleFieldInput = () => {
  if (registrationNotification.value?.type === 'error') {
    registrationNotification.value = null;
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
      notificationTimeout = null;
    }
  }
};

async function submitForm() {
  if (form.password !== form.rePassword) {
    setRegistrationNotification("error", "Passwords do not match.");
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      credentials: 'include',
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
      const errors = Array.isArray(errorData.errors)
        ? errorData.errors.join(", ")
        : errorData.errors || "Unknown error";
      setRegistrationNotification("error", "Registration failed: " + errors);
      return;
    }

    await response.json();
    setRegistrationNotification("success", "Registration successful! Redirecting to login...");
    redirectTimeout = setTimeout(async () => {
      await router.push("/login");
    }, 900);
  } catch (err) {
    console.error(err);
    setRegistrationNotification("error", "Something went wrong. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
}

onBeforeUnmount(() => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.registration-main {
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

.registration-main::before {
  content: '';
  position: absolute;
  top: -25%;
  left: -25%;
  width: 150%;
  height: 150%;
  background: radial-gradient(circle, rgba(116, 235, 213, 0.2) 0%, transparent 60%);
  animation: floatReverse 25s ease-in-out infinite;
  pointer-events: none;
}

@keyframes floatReverse {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-30px, 30px) rotate(-120deg); }
  66% { transform: translate(20px, -20px) rotate(-240deg); }
}

.registration-form-container {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-large);
  padding: 3rem;
  width: 500px;
  max-width: 90%;
  box-shadow: var(--box-shadow-default);
  position: relative;
  z-index: 10;
  transition: all var(--transition-normal);
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.registration-form-container:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-hover);
  border-color: rgba(255, 255, 255, 0.15);
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
}

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.registration-notification {
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border-radius: var(--radius-medium);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  border: 1px solid transparent;
  animation: slideInUp 0.25s ease-out;
}

.registration-notification--success {
  background: linear-gradient(135deg, rgba(116, 235, 213, 0.2), rgba(79, 157, 255, 0.12));
  border-color: rgba(116, 235, 213, 0.45);
  box-shadow: 0 4px 14px rgba(116, 235, 213, 0.2);
}

.registration-notification--error {
  background: linear-gradient(135deg, rgba(230, 57, 70, 0.22), rgba(230, 57, 70, 0.08));
  border-color: rgba(230, 57, 70, 0.55);
  box-shadow: 0 4px 14px rgba(230, 57, 70, 0.22);
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

.form-group input[type="email"] {
  background-image: linear-gradient(45deg, rgba(79, 157, 255, 0.1), transparent);
}

.form-group input[type="password"] {
  background-image: linear-gradient(45deg, rgba(230, 57, 70, 0.1), transparent);
}

.submit-button {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  padding: 1.2rem 2rem;
  border: none;
  border-radius: var(--radius-medium);
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-top: 1.5rem;
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-normal);
}

.submit-button:hover::before {
  left: 100%;
}

.submit-button:hover {
  background: linear-gradient(135deg, var(--accent-yellow), #ff9800);
  color: #1e3a5f;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 209, 102, 0.5);
}

.submit-button:active {
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.2);
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link a {
  color: #4f9dff;
  font-weight: 600;
  text-decoration: none;
  transition: color var(--transition-normal);
}

/* Form validation styles */
.form-group input:invalid {
  border-color: rgba(230, 57, 70, 0.5);
}

.form-group input:valid {
  border-color: rgba(116, 235, 213, 0.5);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .registration-form-container {
    padding: 2rem;
    width: 100%;
    margin: 1rem;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .registration-form {
    gap: 1rem;
  }
  
  .form-group input {
    padding: 0.875rem;
  }
  
  .submit-button {
    font-size: 1.1rem;
    padding: 1rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .registration-main {
    padding: 1rem;
  }
  
  .title {
    font-size: 1.6rem;
  }
  
  .registration-form-container {
    padding: 1.5rem;
  }
}

/* Success animation for form completion */
@keyframes success {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.form-success {
  animation: success 0.4s ease;
}</style>
