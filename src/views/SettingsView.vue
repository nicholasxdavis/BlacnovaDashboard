<template>
  <div class="page">
    <PageHeader
      title="Settings"
      description="Account, preferences, and support for this client portal."
    />

    <div class="settings-grid">
      <div class="surface surface-pad">
        <div class="section__title">Website</div>
        <div class="info-list">
          <div class="info-row">
            <span class="info-label">Name</span>
            <span>{{ clientStore.client.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Domain</span>
            <a
              :href="'https://' + clientStore.client.domain"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ clientStore.client.domain }}
            </a>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span
              class="status-dot"
              :class="websiteStore.maintenance.enabled ? 'status-dot--warn' : 'status-dot--ok'"
            >
              {{ websiteStore.maintenance.enabled ? 'Maintenance' : 'Live' }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Enabled modules</span>
            <span>{{ moduleLabels }}</span>
          </div>
        </div>
      </div>

      <div class="surface surface-pad">
        <div class="section__title">Account</div>
        <div class="info-list">
          <div class="info-row">
            <span class="info-label">Signed in as</span>
            <span>{{ auth.user?.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span>{{ auth.user?.email }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Role</span>
            <span>{{ auth.user?.role }}</span>
          </div>
        </div>
        <div class="btn-row">
          <el-button @click="passwordOpen = true">Change password</el-button>
          <el-button @click="confirmSignOut">Sign out</el-button>
        </div>
      </div>

      <div class="surface surface-pad">
        <div class="section__title">Notifications</div>
        <p class="section__desc">Choose what you want to be notified about in this portal.</p>
        <div class="pref-list">
          <label class="pref-row">
            <div>
              <div class="pref-title">New form submissions</div>
              <div class="pref-hint">Show a badge and notification when someone submits a form</div>
            </div>
            <el-switch v-model="prefs.submissions" @change="savePrefs" />
          </label>
          <label class="pref-row">
            <div>
              <div class="pref-title">Maintenance reminders</div>
              <div class="pref-hint">Remind you when maintenance mode is still on</div>
            </div>
            <el-switch v-model="prefs.maintenance" @change="savePrefs" />
          </label>
        </div>
      </div>

      <div class="surface surface-pad">
        <div class="section__title">Support</div>
        <p class="section__desc">
          Need help with your website or this dashboard? Message Blacnova Development.
        </p>
        <div class="info-list" style="margin-bottom: 16px">
          <div class="info-row">
            <span class="info-label">Email</span>
            <a :href="'mailto:' + auth.supportEmail">{{ auth.supportEmail }}</a>
          </div>
          <div class="info-row">
            <span class="info-label">Hours</span>
            <span>Mon-Fri, 9am-5pm MT</span>
          </div>
        </div>

        <div v-if="ticketSent" class="ticket-success">
          <PhCheckCircle :size="18" weight="fill" />
          <div>
            Message sent. We'll get back to you at your account email.
          </div>
        </div>

        <div v-else class="ticket-form">
          <div>
            <label class="field-label" for="ticket-topic">Topic</label>
            <el-select id="ticket-topic" v-model="ticket.topic" style="width: 100%">
              <el-option label="Website content help" value="content" />
              <el-option label="Technical issue" value="technical" />
              <el-option label="Billing or account" value="billing" />
              <el-option label="Something else" value="other" />
            </el-select>
          </div>
          <div>
            <label class="field-label" for="ticket-message">Message</label>
            <el-input
              id="ticket-message"
              v-model="ticket.message"
              type="textarea"
              :rows="4"
              maxlength="800"
              show-word-limit
              placeholder="Tell us what you need help with"
            />
          </div>
          <el-button type="primary" :loading="ticketSending" :disabled="!canSendTicket" @click="sendTicket">
            Send message
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog v-model="passwordOpen" title="Change password" width="400px" destroy-on-close>
      <div class="ticket-form">
        <div>
          <label class="field-label" for="pw-current">Current password</label>
          <el-input id="pw-current" v-model="passwordForm.current" type="password" show-password />
        </div>
        <div>
          <label class="field-label" for="pw-new">New password</label>
          <el-input id="pw-new" v-model="passwordForm.next" type="password" show-password />
        </div>
        <div>
          <label class="field-label" for="pw-confirm">Confirm new password</label>
          <el-input id="pw-confirm" v-model="passwordForm.confirm" type="password" show-password />
        </div>
      </div>
      <template #footer>
        <el-button @click="passwordOpen = false">Cancel</el-button>
        <el-button type="primary" :loading="passwordSaving" @click="savePassword">Update password</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhCheckCircle } from '@phosphor-icons/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import { ALL_NAV } from '@/config/client'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/client'
import { useWebsiteStore } from '@/stores/website'

const router = useRouter()
const auth = useAuthStore()
const clientStore = useClientStore()
const websiteStore = useWebsiteStore()

const prefs = reactive({
  submissions: true,
  maintenance: true,
})

onMounted(() => {
  prefs.submissions = auth.preferences.submissions
  prefs.maintenance = auth.preferences.maintenance
})

const ticket = reactive({
  topic: 'content',
  message: '',
})
const ticketSending = ref(false)
const ticketSent = ref(false)

const passwordOpen = ref(false)
const passwordSaving = ref(false)
const passwordForm = reactive({
  current: '',
  next: '',
  confirm: '',
})

const moduleLabels = computed(() =>
  ALL_NAV.filter((n) => clientStore.client.modules.includes(n.key))
    .map((n) => n.label)
    .join(', '),
)

const canSendTicket = computed(() => ticket.message.trim().length >= 10)

async function savePrefs() {
  try {
    await auth.savePreferences({ ...prefs })
    ElMessage.success('Notification preferences saved')
  } catch {
    ElMessage.error('Could not save preferences')
  }
}

async function sendTicket() {
  if (!canSendTicket.value) {
    ElMessage.error('Please enter a bit more detail (at least 10 characters)')
    return
  }
  ticketSending.value = true
  try {
    await auth.sendSupport(ticket.topic, ticket.message.trim())
    ticketSent.value = true
    ticket.message = ''
    ElMessage.success('Support message sent')
  } catch {
    ElMessage.error('Could not send support message')
  } finally {
    ticketSending.value = false
  }
}

async function savePassword() {
  if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
    ElMessage.error('Fill in all password fields')
    return
  }
  if (passwordForm.next.length < 12) {
    ElMessage.error('New password must be at least 12 characters')
    return
  }
  if (passwordForm.next !== passwordForm.confirm) {
    ElMessage.error('New passwords do not match')
    return
  }
  passwordSaving.value = true
  try {
    await auth.changePassword(passwordForm.current, passwordForm.next)
    passwordOpen.value = false
    passwordForm.current = ''
    passwordForm.next = ''
    passwordForm.confirm = ''
    ElMessage.success('Password updated — sign in again')
    await router.push('/login')
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      'Could not update password'
    ElMessage.error(message)
  } finally {
    passwordSaving.value = false
  }
}

async function confirmSignOut() {
  try {
    await ElMessageBox.confirm('Sign out of the Blacnova client portal?', 'Sign out', {
      confirmButtonText: 'Sign out',
      cancelButtonText: 'Cancel',
    })
    websiteStore.clear()
    await auth.logout()
    router.push('/login')
  } catch {
    /* cancelled */
  }
}
</script>

<style scoped lang="scss">
.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  font-size: 14px;
  color: $bn-gray-900;
}

.info-label {
  color: $bn-gray-500;
  font-size: 13px;
}

.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.pref-list {
  display: flex;
  flex-direction: column;
}

.pref-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: $bn-border;
  cursor: pointer;
}

.pref-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.pref-row:first-child {
  padding-top: 0;
}

.pref-title {
  font-size: 14px;
  font-weight: 500;
  color: $bn-gray-900;
}

.pref-hint {
  font-size: 12px;
  color: $bn-gray-500;
  margin-top: 2px;
}

.ticket-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ticket-success {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: $bn-orange-soft;
  border: 1px solid $bn-orange-border;
  border-radius: $bn-radius;
  color: $bn-gray-700;
  font-size: 13px;
}

.ticket-success strong {
  color: $bn-black;
  margin-right: 4px;
}

a {
  color: $bn-orange;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 800px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
