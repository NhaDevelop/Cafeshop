<template>
  <div class="login-page">
    <div class="bg-blur" />
    <div class="login-card card fade-in">
      <div class="login-header">
        <div class="login-logo"><Coffee :size="48" class="text-primary" /></div>
        <h1 class="login-title">Cafe NUX</h1>
        <p class="login-sub text-muted">Admin Panel — Sign in to continue</p>
      </div>
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label class="label">Email</label>
          <input id="login-email" v-model="email" type="email" class="input" placeholder="admin@cafenux.com" required autofocus />
        </div>
        <div class="field">
          <label class="label">Password</label>
          <input id="login-password" v-model="password" type="password" class="input" placeholder="••••••••" required />
        </div>
        <p v-if="auth.error" class="error-msg flex-align"><AlertTriangle :size="14" class="icon-inline" /> {{ auth.error }}</p>
        <button id="login-submit" type="submit" class="btn btn-primary submit-btn flex-align" :disabled="auth.loading">
          <span v-if="auth.loading">Signing in…</span>
          <span v-else class="flex-align">Sign In <ArrowRight :size="16" class="icon-inline"/></span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Coffee, AlertTriangle, ArrowRight } from '@lucide/vue'

definePageMeta({ layout: 'default' })
const auth     = useAuthStore()
const router   = useRouter()
const email    = ref('')
const password = ref('')
const handleSubmit = async () => {
  try {
    await auth.login({ email: email.value, password: password.value })
    router.push('/pos')
  } catch {}
}
</script>

<style scoped>
.login-page { min-height:100vh; display:flex; align-items:center; justify-content:center; position:relative; }
.bg-blur {
  position:absolute; inset:0;
  background: radial-gradient(ellipse at 40% 40%, rgba(200,134,10,.12) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(245,200,66,.06) 0%, transparent 50%);
}
.login-card { width: 420px; position:relative; z-index:1; }
.login-header { text-align:center; margin-bottom:32px; }
.login-logo { margin-bottom:16px; display:flex; justify-content:center; }
.text-primary { color:var(--color-primary); }
.login-title { font-size:28px; font-weight:800; letter-spacing:-.02em; margin-bottom:6px; }
.login-sub { font-size:14px; }
.login-form { display:flex; flex-direction:column; gap:16px; }
.field { display:flex; flex-direction:column; gap:6px; }
.label { font-size:13px; font-weight:500; color:var(--color-muted); }
.input {
  background:var(--color-surface-2); border:1px solid var(--color-border);
  border-radius:var(--radius); padding:12px 14px; color:var(--color-text);
  font-size:14px; font-family:var(--font); outline:none; transition:border var(--transition);
}
.input:focus { border-color:var(--color-primary); }
.error-msg { font-size:13px; color:var(--color-danger); background:rgba(239,68,68,.08); padding:10px 14px; border-radius:var(--radius); }
.submit-btn { width:100%; padding:14px; font-size:15px; margin-top:8px; }
.flex-align { display:flex; align-items:center; justify-content:center; gap:6px; }
</style>
