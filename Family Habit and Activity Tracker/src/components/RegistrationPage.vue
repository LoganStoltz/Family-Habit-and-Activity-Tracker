<template>
  <section class="Registration-main-section">
    
    <!-- Registration Form -->
    <div class="Registration-form-section">
        <form class="Registration-form" @submit.prevent="submitForm">
            <div class="Registration-group">
                <label for="firstName">First Name</label>
                <input type="text" id="firstName" v-model="form.firstName" required />
            </div>

            <div class="Registration-group">
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName" v-model="form.lastName" required />
            </div>

            <div class="Registration-group">
                <label for="userName">User Name</label>
                <input type="text" id="userName" v-model="form.userName" required />
            </div>

            <div class="Registration-group">
                <label for="Email">Email</label>
                <input type="email" id="email" v-model="form.email" />
            </div>

            <div class="Registration-group">
                <label for="phoneNumber">Email</label>
                <input type="tel" id="phoneNumber" v-model="form.phoneNumber" />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" v-model="form.password" required/>
            </div>

            <div class="form-group">
                <label for="rePassword">Password</label>
                <input type="password" id="rePassword" v-model="form.rePassword" required/>
            </div>

            <button type="submit" class="submit-button">Send Message</button>
        </form>
    </div>
  </section>
</template>

<script>
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.Registration-main-section {
  font-family: 'Inter', sans-serif;
  background: rgb(52, 54, 77);
  min-height: 100vh;
}

/* Form */
.Registration-form-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.192);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem auto;        
  box-shadow: var(--box-shadow-default);
  width: 80%;
}

.Registration-form {
  background: var(--background-light);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--box-shadow-default);
  margin: 0 auto;
  width: 100%;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-dark-on-light);
}

input,
textarea {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 10px;
  border: 2px solid #ccc;
  font-family: 'Inter', sans-serif;
  resize: none;
  background: var(--box-shadow-default);
  color: white;
}

input:focus,
textarea:focus {
  outline: none;
  border: 2px solid var(--accent-blue);
}

.submit-button {
  background-color: var(--background-blue);
  color: var(--text-primary);
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.submit-button:hover {
  background-color: var(--accent-yellow);
  color: var(--background-header);
}
</style>
