<template>
  <section class="accountRecoveryPage">
    <form class="accountPanel" @submit.prevent="recoverAccount">
        <div class="accountPanelText">
            <h1>Account Recovery</h1>
            <p>Please enter your email address to recover your account.</p>
        </div>
        <div
          v-if="notification"
          class="recovery-notification"
          :class="`recovery-notification--${notification.type}`"
          role="status"
          aria-live="polite"
        >
          {{ notification.message }}
        </div>
        <div class="inputArea">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" @input="handleFieldInput" required />
        </div>
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending recovery...' : 'Recover Account' }}
        </button>
    </form>
  </section>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      isSubmitting: false,
      notification: null,
      notificationTimeout: null,
      submitDelayTimeout: null
    };
  },
  methods: {
    setNotification(type, message) {
      this.notification = { type, message };

      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }

      if (type === 'error') {
        this.notificationTimeout = setTimeout(() => {
          this.notification = null;
          this.notificationTimeout = null;
        }, 5000);
      }
    },
    handleFieldInput() {
      if (this.notification?.type === 'error') {
        this.notification = null;

        if (this.notificationTimeout) {
          clearTimeout(this.notificationTimeout);
          this.notificationTimeout = null;
        }
      }
    },
    async recoverAccount() {
      this.isSubmitting = true;

      try {
        await new Promise((resolve) => {
          this.submitDelayTimeout = setTimeout(() => {
            this.submitDelayTimeout = null;
            resolve();
          }, 700);
        });

        this.setNotification('success', 'If an account with that email exists, recovery instructions have been sent.');
      } catch (error) {
        console.error(error);
        this.setNotification('error', 'Could not process account recovery right now. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
    }
  },
  beforeUnmount() {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    if (this.submitDelayTimeout) {
      clearTimeout(this.submitDelayTimeout);
    }
  }
}
</script>

<style scoped>
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
  margin-bottom: 1rem;
  font-size: 1rem;
}

.accountPanelText h1 {
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.accountPanelText p {
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1.5rem;
}

.recovery-notification {
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border-radius: var(--radius-medium);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  border: 1px solid transparent;
}

.recovery-notification--success {
  background: linear-gradient(135deg, rgba(116, 235, 213, 0.2), rgba(79, 157, 255, 0.12));
  border-color: rgba(116, 235, 213, 0.45);
  box-shadow: 0 4px 14px rgba(116, 235, 213, 0.2);
}

.recovery-notification--error {
  background: linear-gradient(135deg, rgba(230, 57, 70, 0.22), rgba(230, 57, 70, 0.08));
  border-color: rgba(230, 57, 70, 0.55);
  box-shadow: 0 4px 14px rgba(230, 57, 70, 0.22);
}

.accountPanel {
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

.inputArea label {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: block;
}

.inputArea input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border-radius: var(--radius-medium);
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  transition: all var(--transition-normal);
  box-sizing: border-box;
}

.inputArea input:focus {
  outline: none;
  border-color: #4f9dff;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(79, 157, 255, 0.1);
}

.accountPanel button {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: var(--radius-medium);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100%;
  margin-top: 0.5rem;
}

.accountPanel button:hover {
  background: linear-gradient(135deg, var(--accent-yellow), #ff9800);
  color: #1e3a5f;
  transform: translateY(-2px);
}

.accountPanel button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
</style>