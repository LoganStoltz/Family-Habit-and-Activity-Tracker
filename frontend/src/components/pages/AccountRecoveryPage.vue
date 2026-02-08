<template>
  <section class="accountRecoveryPage">
    <form class="accountPanel" @submit.prevent="recoverAccount">
        <div class="accountPanelText">
            <h1>Account Recovery</h1>
            <p>Please enter your email address to recover your account.</p>
        </div>
        <div class="inputArea">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required />
        </div>
        <button type="submit">Recover Account</button>
    </form>
  </section>
</template>

<script>
export default {
  data() {
    return {
      email: ''
    };
  },
  methods: {
    recoverAccount() {
      // Implement account recovery logic here
      console.log(`Recovering account for email: ${this.email}`);
    }
  }
}
</script>

<style>
.accountRecoveryPage {
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

.inputArea {
    margin-bottom: 10px;
    font-size: 16px;
}
.accountPanel {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-large);
    padding: 3rem;
    width: 450px;   
    box-shadow: var(--box-shadow-default);
    position: relative;
    z-index: 1;
    transition: all var(--transition-normal);
    animation: slideIn 0.6s ease-out;
}
</style>