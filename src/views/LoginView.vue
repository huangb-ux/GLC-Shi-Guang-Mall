<script setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Icon from '../components/Icon.vue';
import { loginAccount, registerAccount } from '../stores/market';
import { toast } from '../stores/ui';
import { COLLEGES } from '../data/site';

const route = useRoute();
const router = useRouter();
const mode = ref('login');
const submitting = ref(false);
const error = ref('');

const loginForm = reactive({ identifier: '', password: '' });
const registerForm = reactive({ name: '', phone: '', dept: COLLEGES[4], password: '', confirm: '' });

const redirectTo = computed(() => {
  const target = String(route.query.redirect || '/');
  return target.startsWith('/') ? target : '/';
});

function switchMode(next) {
  mode.value = next;
  error.value = '';
}

async function submitLogin() {
  error.value = '';
  if (!loginForm.identifier.trim() || !loginForm.password) {
    error.value = '请填写账号和密码';
    return;
  }
  submitting.value = true;
  try {
    const account = await loginAccount(loginForm.identifier, loginForm.password);
    toast(account.role === 'admin' ? '管理员登录成功' : `欢迎回来，${account.name}`);
    router.replace(account.role === 'admin' ? '/admin' : redirectTo.value);
  } catch (err) {
    error.value = err.message || '登录失败';
  } finally {
    submitting.value = false;
  }
}

async function submitRegister() {
  error.value = '';
  if (!registerForm.name.trim()) {
    error.value = '请填写昵称';
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone.trim())) {
    error.value = '请输入正确的 11 位手机号';
    return;
  }
  if (registerForm.password.length < 6) {
    error.value = '密码至少 6 位';
    return;
  }
  if (registerForm.password !== registerForm.confirm) {
    error.value = '两次输入的密码不一致';
    return;
  }

  submitting.value = true;
  try {
    const account = await registerAccount({
      name: registerForm.name,
      phone: registerForm.phone.trim(),
      password: registerForm.password,
      dept: registerForm.dept
    });
    toast(`注册成功，欢迎你，${account.name}`);
    router.replace(redirectTo.value);
  } catch (err) {
    error.value = err.message || '注册失败';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="page-fade auth-page">
    <div class="auth-shell">
      <RouterLink class="auth-brand" to="/">
        <span class="brand-mark">拾</span>
        <span class="brand-text"><b>拾光集</b><em>SHIGUANG MARKET</em></span>
      </RouterLink>

      <div class="auth-card">
        <p class="eyebrow">GUILIN UNIVERSITY · CAMPUS MARKET</p>
        <h1>{{ mode === 'login' ? '欢迎回到拾光集。' : '注册一个校园账号。' }}</h1>
        <p class="auth-sub">
          {{ mode === 'login' ? '一个手机号只能绑定一个账号。' : '手机号就是你的校园身份，注册后不可重复。' }}
        </p>

        <div class="auth-tabs">
          <button type="button" :class="{ 'is-active': mode === 'login' }" @click="switchMode('login')">登录</button>
          <button type="button" :class="{ 'is-active': mode === 'register' }" @click="switchMode('register')">注册</button>
        </div>

        <div v-if="error" class="auth-error">{{ error }}</div>

        <form v-if="mode === 'login'" class="auth-form" @submit.prevent="submitLogin">
          <div class="field">
            <label class="field-label" for="login-identifier">手机号 / 管理员账号</label>
            <input id="login-identifier" v-model="loginForm.identifier" class="input" placeholder="例如：13800138000 或 admin" autocomplete="username">
          </div>
          <div class="field">
            <label class="field-label" for="login-password">密码</label>
            <input id="login-password" v-model="loginForm.password" class="input" type="password" placeholder="请输入密码" autocomplete="current-password">
          </div>
          <button class="btn btn-primary btn-block auth-submit" type="submit" :disabled="submitting">
            {{ submitting ? '登录中…' : '登录' }} <Icon name="arrow" />
          </button>
          <p class="auth-switch">还没有账号？<button type="button" @click="switchMode('register')">立即注册</button></p>
          <div class="auth-admin-hint">
            演示管理员：<b>admin</b> / <b>public</b>
          </div>
        </form>

        <form v-else class="auth-form" @submit.prevent="submitRegister">
          <div class="form-row">
            <div class="field">
              <label class="field-label" for="reg-name">昵称</label>
              <input id="reg-name" v-model="registerForm.name" class="input" maxlength="12" placeholder="例如：小林">
            </div>
            <div class="field">
              <label class="field-label" for="reg-phone">手机号</label>
              <input id="reg-phone" v-model="registerForm.phone" class="input" inputmode="numeric" maxlength="11" placeholder="11 位手机号" autocomplete="tel">
            </div>
          </div>
          <div class="field">
            <label class="field-label" for="reg-dept">所属学院<span class="req">*</span></label>
            <select id="reg-dept" v-model="registerForm.dept" class="select">
              <option v-for="college in COLLEGES" :key="college" :value="college">{{ college }}</option>
            </select>
            <p class="field-hint">院系名称按桂林学院官网「机构设置」整理。</p>
          </div>
          <div class="form-row">
            <div class="field">
              <label class="field-label" for="reg-password">密码</label>
              <input id="reg-password" v-model="registerForm.password" class="input" type="password" placeholder="至少 6 位" autocomplete="new-password">
            </div>
            <div class="field">
              <label class="field-label" for="reg-confirm">确认密码</label>
              <input id="reg-confirm" v-model="registerForm.confirm" class="input" type="password" placeholder="再输一次" autocomplete="new-password">
            </div>
          </div>
          <button class="btn btn-primary btn-block auth-submit" type="submit" :disabled="submitting">
            {{ submitting ? '注册中…' : '注册并登录' }} <Icon name="arrow" />
          </button>
          <p class="auth-switch">已经有账号？<button type="button" @click="switchMode('login')">去登录</button></p>
        </form>
      </div>

      <RouterLink class="auth-back" to="/">← 先随便逛逛</RouterLink>
    </div>
  </div>
</template>
