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
