<template>
  <div class="profile-registration-container">
    <h1 class="title">Register Profile</h1>

    <form class="registration-form" @submit.prevent="submitForm">
      <div class="form-group">
        <label for="first_name">First Name</label>
        <input type="text" id="first_name" v-model="form.first_name" required />
      </div>

      <div class="form-group">
        <label for="last_name">Last Name</label>
        <input type="text" id="last_name" v-model="form.last_name" required />
      </div>

      <div class="form-group">
        <label for="dob">Date of Birth</label>
        <input type="date" id="dob" v-model="form.dob" required />
      </div>

      <div class="form-group">
        <label for="profile_type">Profile Type</label>
        <select id="profile_type" v-model="form.profile_type" required>
          <option value="">Select Type</option>
          <option value="Baby">Baby</option>
          <!--<option value="Child">Child</option>   Maybe implement later-->
          <!--<option value="Teen">Teen</option>   Maybe implement later-->
          <option value="Adult">Adult</option>
        </select>
      </div>

      <button type="submit" class="submit-button">Create Profile</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

// Define emits
const emit = defineEmits(['profile-created']);

const router = useRouter();

const form = reactive({
  first_name: '',
  last_name: '',
  dob: '',
  profile_type: ''
});

const submitForm = async () => {
  try {
    // Get the currently logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      alert('User not logged in!');
      return;
    }

    // POST request to nested route /users/:user_id/profiles
    const response = await fetch(`http://localhost:3000/users/${user.id}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: form }), // Wrap form data in 'profile' key
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert('Profile creation failed: ' + (errorData.error || 'Unknown error'));
      return;
    }

    const data = await response.json();
    console.log('Profile created:', data);

    // Format the profile data consistently for localStorage
    const newProfile = {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name || '',
      dob: data.dob,
      profile_type: data.profile_type
    };

    // Store the new profile in localStorage
    localStorage.setItem('profile', JSON.stringify(newProfile));
    
    // Fire storage event so Header and other components pick up the change immediately
    window.dispatchEvent(new Event('storage'));

    // Emit the profile-created event with the formatted profile data (not raw data)
    emit('profile-created', newProfile);

    alert('Profile created successfully!');
    
    // Redirect to the profile main page
    router.push('/profile-main');
  } catch (err) {
    console.error(err);
    alert('Something went wrong while creating the profile.');
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.profile-registration-container {
  font-family: 'Inter', sans-serif;
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-large);
  padding: 2rem;
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
}

.title {
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-weight: 600;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  display: block;
  font-size: 0.9rem;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 2px solid #4a5568;
  background: #2d3748;
  color: var(--text-primary);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #4f9dff;
  box-shadow: 0 0 0 3px rgba(79, 157, 255, 0.1);
  background: #374151;
}

.form-group select {
  cursor: pointer;
}

.submit-button {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 157, 255, 0.5);
  background: linear-gradient(135deg, #74ebd5, #4f9dff);
}

.submit-button:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .profile-registration-container {
    padding: 1.5rem;
  }
  
  .title {
    font-size: 1.5rem;
  }
}
</style>
