<template>
    <div>
        <h1> Select Profile </h1>
        <div class="profile-list">
            <div class="profile-card" v-for="user in users" :key="user.id">
                <p>{{ user.firstName }}</p>
            </div>
        </div>
        <button @click="toggleComponent"> Add Profile </button>
        <div v-if="showProfileRegistration">
            <ProfileRegistration />
        </div>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import ProfileRegistration from './ProfileRegistration.vue';

export default defineComponent({
    name: 'ProfileSelect',
        components: {
            ProfileRegistration
        },
    methods: {
        toggleComponent() {
            this.showProfileRegistration = !this.showProfileRegistration;
        }
    },

    setup() {
        const users = ref([]);

        onMounted(async () => {
            const response = await fetch('http://localhost:3000/users');
            users.value = await response.json();
        });

        return { users };
    },
    data(){
        return {
            showProfileRegistration: false
        };
    }
});
</script>

<style>
</style>