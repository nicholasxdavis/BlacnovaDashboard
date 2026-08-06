<template>
  <div class="login">
    <a
      class="login-back"
      href="https://www.blacnova.net"
      aria-label="Website"
    >
      <span class="login-back__inner">
        <img class="login-back__mark" src="/bn.png" alt="" width="20" height="20" />
        <span class="login-back__label">Website</span>
      </span>
    </a>

    <div class="login__panel">
      <template v-if="!showForgot">
        <h1>Sign in</h1>
        <p class="login__desc">Access your website management dashboard.</p>

        <el-form class="login__form" @submit.prevent="onSubmit">
          <div>
            <label class="field-label" for="email">Email</label>
            <el-input
              id="email"
              v-model="email"
              type="email"
              autocomplete="username"
              :class="{ 'is-error': emailError }"
              @blur="validateEmail"
            />
            <p v-if="emailError" class="field-error" role="alert">{{ emailError }}</p>
          </div>
          <div>
            <label class="field-label" for="password">Password</label>
            <el-input
              id="password"
              v-model="password"
              type="password"
              show-password
              autocomplete="current-password"
              :class="{ 'is-error': passwordError }"
              @blur="validatePassword"
            />
            <p v-if="passwordError" class="field-error" role="alert">{{ passwordError }}</p>
          </div>

          <div class="login__meta">
            <label class="remember">
              <input v-model="rememberMe" type="checkbox" class="remember__input" />
              <span>Remember me</span>
            </label>
            <button type="button" class="forgot-link" @click="showForgot = true">
              Forgot password?
            </button>
          </div>

          <el-button
            class="login__submit"
            native-type="submit"
            :loading="loading"
            :disabled="loading"
          >
            Sign in
          </el-button>
        </el-form>

        <p class="login__hint">Sign in with your Blacnova account.</p>
      </template>

      <template v-else>
        <h1>Forgot password</h1>
        <p class="login__desc">
          Email
          <a class="support-email" href="mailto:nic@blacnova.net">nic@blacnova.net</a>
          to reset your password. Include the email on your account and we'll help you get back in.
        </p>
        <a class="login__submit login__submit--link" href="mailto:nic@blacnova.net">
          Email nic@blacnova.net
        </a>
        <button type="button" class="back-link" @click="showForgot = false">
          Back to sign in
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useWebsiteStore } from '@/stores/website'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const websiteStore = useWebsiteStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(true)
const showForgot = ref(false)
const loading = ref(false)
const emailError = ref('')
const passwordError = ref('')

onMounted(() => {
  const remembered = localStorage.getItem('bn-remember-email')
  if (remembered) email.value = remembered
})

function validateEmail() {
  emailError.value = email.value.trim() ? '' : 'Enter your email'
}

function validatePassword() {
  passwordError.value = password.value ? '' : 'Enter your password'
}

async function onSubmit() {
  validateEmail()
  validatePassword()
  if (emailError.value || passwordError.value) {
    ElMessage.error('Enter your email and password')
    return
  }
  loading.value = true
  try {
    await auth.login(email.value.trim(), password.value)
    if (rememberMe.value) {
      localStorage.setItem('bn-remember-email', email.value.trim())
    } else {
      localStorage.removeItem('bn-remember-email')
    }
    await websiteStore.fetchDashboard()
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/overview'
    await router.push(redirect)
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Invalid email or password'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
/* Auth-only Blacnova marketing tokens. Does not affect the dashboard. */
.login {
  --auth-font: Poppins, sans-serif;
  --auth-text-primary: #ffffff;
  --auth-text-secondary: #d1d5db;
  --auth-text-muted: #9ca3af;
  --auth-surface-base: #000000;
  --auth-surface-strong: #161618;
  --auth-surface-raised: #d4611c;
  --auth-border: #484848;
  --auth-border-focus: #e5e7eb;
  --auth-space-3: 9px;
  --auth-space-4: 13.5px;
  --auth-space-7: 18px;
  --auth-radius: 27px;
  --auth-motion: 200ms;

  position: relative;
  height: 100%;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #ffffff;
  font-family: var(--auth-font);
  color: var(--auth-text-primary);
}

/* Website/blog-style previous-page tab — icon only until hover; expanded on mobile */
.login-back {
  position: fixed;
  top: 120px;
  left: 0;
  z-index: 60;
  display: block;
  margin-left: -4px;
  height: 48px;
  padding: 0 16px 0 10px;
  background: var(--auth-surface-raised);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: none;
  border-radius: 0 8px 8px 0;
  text-decoration: none;
  font-family: var(--auth-font);
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
  transition: margin-left var(--auth-motion) ease, box-shadow var(--auth-motion) ease;
  overflow: hidden;
}

.login-back:hover,
.login-back:focus-visible {
  margin-left: 0;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
  color: #fff;
}

.login-back__inner {
  display: flex;
  align-items: center;
  height: 100%;
  white-space: nowrap;
}

.login-back__mark {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  object-fit: cover;
  flex-shrink: 0;
  display: block;
  transition: transform var(--auth-motion) ease;
}

.login-back:hover .login-back__mark,
.login-back:focus-visible .login-back__mark {
  transform: translateX(2px);
}

.login-back__label {
  max-width: 0;
  margin-left: 0;
  overflow: hidden;
  line-height: 1;
  letter-spacing: -0.01em;
  opacity: 0;
  transition: max-width var(--auth-motion) ease, margin-left var(--auth-motion) ease,
    opacity var(--auth-motion) ease;
}

.login-back:hover .login-back__label,
.login-back:focus-visible .login-back__label {
  max-width: 120px;
  margin-left: 8px;
  opacity: 1;
}

@media (max-width: 640px) {
  .login-back {
    margin-left: 0;
  }

  .login-back__label {
    max-width: 120px;
    margin-left: 8px;
    opacity: 1;
  }
}

.login__panel {
  width: 100%;
  max-width: 400px;
  background: var(--auth-surface-strong);
  border: 1px solid var(--auth-border);
  border-radius: var(--auth-radius);
  padding: 32px 28px;
}

h1 {
  font-family: var(--auth-font);
  font-size: 22.5px;
  font-weight: 400;
  line-height: 1.35;
  color: var(--auth-text-primary);
  margin-bottom: 6px;
}

.login__desc {
  color: var(--auth-text-muted);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.support-email {
  color: var(--auth-surface-raised);
  text-decoration: none;
  font-weight: 500;
}

.support-email:hover {
  text-decoration: underline;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: var(--auth-space-7);
}

.field-label {
  display: block;
  font-family: var(--auth-font);
  font-size: 13.5px;
  font-weight: 400;
  color: var(--auth-text-secondary);
  margin-bottom: var(--auth-space-3);
}

.field-error {
  margin-top: var(--auth-space-3);
  font-size: 13.5px;
  color: #f87171;
}

.login__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.remember {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: var(--auth-text-secondary);
  cursor: pointer;
  user-select: none;
}

.remember__input {
  width: 15px;
  height: 15px;
  accent-color: var(--auth-surface-raised);
  cursor: pointer;
}

.forgot-link,
.back-link {
  border: none;
  background: none;
  padding: 0;
  font-family: var(--auth-font);
  font-size: 13.5px;
  color: var(--auth-surface-raised);
  cursor: pointer;
}

.forgot-link:hover,
.back-link:hover {
  text-decoration: underline;
}

.back-link {
  display: block;
  width: 100%;
  margin-top: var(--auth-space-7);
  text-align: center;
}

.login__hint {
  margin-top: var(--auth-space-7);
  font-size: 13.5px;
  color: var(--auth-text-muted);
  text-align: center;
}

:deep(.el-input__wrapper) {
  background: var(--auth-surface-base) !important;
  border-radius: 9999px !important;
  box-shadow: 0 0 0 1px var(--auth-border) inset !important;
  padding: 4px 16px !important;
  transition: box-shadow var(--auth-motion) ease !important;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #6b6b6b inset !important;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--auth-border-focus) inset !important;
}

:deep(.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f87171 inset !important;
}

:deep(.el-input__inner) {
  color: var(--auth-text-primary) !important;
  font-family: var(--auth-font) !important;
  font-size: 15.75px !important;
}

:deep(.el-input__inner::placeholder) {
  color: var(--auth-text-muted) !important;
}

:deep(.el-input__suffix) {
  color: var(--auth-text-muted) !important;
}

:deep(.el-input__suffix .el-icon) {
  color: var(--auth-text-muted) !important;
}

.login__submit {
  width: 100%;
  height: 44px;
  border: none !important;
  border-radius: 9999px !important;
  background: var(--auth-surface-raised) !important;
  color: var(--auth-text-primary) !important;
  font-family: var(--auth-font) !important;
  font-size: 15.75px !important;
  font-weight: 400 !important;
  transition: opacity var(--auth-motion) ease, filter var(--auth-motion) ease !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.login__submit--link {
  line-height: 44px;
}

.login__submit:hover:not(:disabled) {
  filter: brightness(1.08);
}

.login__submit:focus-visible {
  outline: 2px solid var(--auth-border-focus);
  outline-offset: 2px;
}

.login__submit:active:not(:disabled) {
  filter: brightness(0.95);
}

.login__submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
