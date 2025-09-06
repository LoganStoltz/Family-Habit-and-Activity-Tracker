<template>
  <div>
    <h1>Select Profile</h1>
    <div class="profile-list">
      <div class="profile-card" v-for="profile in profiles" :key="profile.id">
        <p>{{ profile.firstName }}</p>
      </div>
    </div>
    <button @click="toggleComponent">Add Profile</button>
    <div v-if="showProfileRegistration">
      <ProfileRegistration @profile-created="addProfile" />
    </div>
  </div>
</template>


<script>
import { defineComponent, ref, onMounted } from "vue";
import ProfileRegistration from "./ProfileRegistration.vue";

export default defineComponent({
  name: "ProfileSelect",
  components: { ProfileRegistration },

  setup() {
    const profiles = ref([]);
    const showProfileRegistration = ref(false);

    const fetchProfiles = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        console.log("User API response:", user);
        const userId = user?.id;
        if (!userId) {
            console.warn("No logged in user found in localStorage");
            return;
        }
        console.log("userId API response:", userId);

        try {
            const response = await fetch(`http://localhost:3000/users/${userId}/profiles`);
            console.log("Response API response:", response);
            if (!response.ok) throw new Error("Failed to fetch profiles");
            const data = await response.json();
            console.log("Profiles API response:", data);

            
            profiles.value = Array.isArray(data)
            ? data.map(profile => ({
                id: profile.id,
                firstName: profile.first_name
                }))
            : [];

        } catch (err) {
            console.error("Error fetching profiles:", err);
        }
    };


    const addProfile = (newProfile) => {
      profiles.value.push({
        id: newProfile.id,
        firstName: newProfile.first_name
      });
      showProfileRegistration.value = false;
    };

    onMounted(fetchProfiles);

    return {
      profiles,
      showProfileRegistration,
      addProfile,
      toggleComponent: () => (showProfileRegistration.value = !showProfileRegistration.value)
    };
  }
});
</script>

<style>
</style>