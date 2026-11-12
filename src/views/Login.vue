<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale, localeOptions } from '@/i18n'
import { ElMessage } from 'element-plus'
import AppIcon from '@/components/AppIcon.vue'

const router = useRouter()
const { t, locale } = useI18n()
const currentLang = computed(() => localeOptions.find((o) => o.value === locale.value)?.short || '中文')
const form = ref({ account: 'admin', password: '123456', remember: true })
const loading = ref(false)

function submit() {
  if (!form.value.account || !form.value.password) {
    ElMessage.warning(t('page.login.empty'))
    return
  }
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success(t('page.login.success'))
    router.push('/event/center')
  }, 350)
}
</script>

<template>
  <div class="login">
    <el-dropdown class="login__lang" trigger="click" @command="setLocale">
      <span class="login__lang-btn">
        <AppIcon name="globe" :size="16" />
        <span>{{ currentLang }}</span>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="opt in localeOptions"
            :key="opt.value"
            :command="opt.value"
            :disabled="locale === opt.value"
          >
            {{ opt.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <div class="login__panel">
      <div class="login__brand">
        <div class="login__mark"><AppIcon name="shield" :size="30" /></div>
        <div class="login__title">{{ t('app.name') }}</div>
        <div class="login__slogan">{{ t('app.slogan') }}</div>
        <ul class="login__points">
          <li><AppIcon name="video" :size="16" /> {{ t('page.login.pointVideo') }}</li>
          <li><AppIcon name="door" :size="16" /> {{ t('page.login.pointDoor') }}</li>
          <li><AppIcon name="bell" :size="16" /> {{ t('page.login.pointEvent') }}</li>
        </ul>
        <div class="login__foot">{{ t('app.footer') }}</div>
      </div>
      <div class="login__form">
        <h2>{{ t('page.login.title') }}</h2>
        <p class="login__hint">{{ t('page.login.hint') }}</p>
        <el-form label-position="top" @submit.prevent="submit">
          <el-form-item :label="t('page.login.account')">
            <el-input v-model="form.account" size="large" :placeholder="t('page.login.accountPlaceholder')" />
          </el-form-item>
          <el-form-item :label="t('page.login.password')">
            <el-input v-model="form.password" size="large" type="password" show-password :placeholder="t('page.login.passwordPlaceholder')" />
          </el-form-item>
          <div class="login__row">
            <el-checkbox v-model="form.remember">{{ t('page.login.remember') }}</el-checkbox>
            <span class="dw-link">{{ t('page.login.forgot') }}</span>
          </div>
          <el-button type="primary" size="large" class="login__submit" :loading="loading" @click="submit">
            {{ t('page.login.submit') }}
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 18% 18%, rgba(47, 123, 255, 0.28), transparent 40%),
    radial-gradient(circle at 82% 82%, rgba(18, 150, 176, 0.2), transparent 45%),
    linear-gradient(120deg, #071426, #0b1f3c 55%, #0a1a31);
}

.login__lang {
  position: fixed;
  top: 20px;
  right: 24px;
  z-index: 10;
}

.login__lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #dbe6f8;
  font-size: 13px;
  cursor: pointer;
}

.login__lang-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.login__panel {
  width: 880px;
  min-height: 520px;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}

.login__brand {
  position: relative;
  padding: 46px 44px;
  color: #fff;
  background:
    radial-gradient(circle at 80% 20%, rgba(61, 139, 255, 0.45), transparent 50%),
    linear-gradient(150deg, #0a1c38, #123564 65%, #0e2648);
  display: flex;
  flex-direction: column;
}

.login__mark {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2f7bff, #1653d6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(26, 102, 255, 0.4);
}

.login__title {
  margin-top: 22px;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}

.login__slogan {
  margin-top: 8px;
  font-size: 13px;
  color: #9db6d8;
  letter-spacing: 1px;
}

.login__points {
  margin: 34px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 13px;
  color: #cfdcef;
}

.login__points li {
  display: flex;
  align-items: center;
  gap: 10px;
}

.login__points :deep(svg) {
  color: #5c93ff;
}

.login__foot {
  margin-top: auto;
  font-size: 11px;
  color: #7490b8;
}

.login__form {
  padding: 54px 46px;
  display: flex;
  flex-direction: column;
}

.login__form h2 {
  font-size: 22px;
  font-weight: 600;
}

.login__hint {
  margin: 8px 0 28px;
  font-size: 12px;
  color: #8a97a8;
}

.login__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  font-size: 13px;
}

.login__submit {
  width: 100%;
  height: 42px;
  font-size: 15px;
  letter-spacing: 4px;
}
</style>
