<template>
  <div class="flex justify-center items-center min-h-screen bg-surface-ground">
    <div class="w-full max-w-[400px] p-8">
      <div class="bg-surface-card p-8 rounded-xl shadow-sm">
        <div class="logo-container flex justify-center items-center mb-8">
          <img src="../assets/logo-colorido.png" alt="logo" class="block dark:hidden h-10 w-40">
          <img src="../assets/logo-dark.png" alt="logo" class="hidden dark:block h-10 w-40">
        </div>

        <div class="mb-6">
          <div class="w-full">
            <InputText v-model="formData.email" placeholder="Email" class="w-full"
              :class="{ 'p-invalid': errors.email }" />
          </div>
          <small class="text-red-500 text-sm mt-1 block" v-if="errors.email">{{ errors.email }}</small>
        </div>

        <div class="mb-6">
          <div class="w-full">
            <Password v-model="formData.password" placeholder="Senha"
              class="w-full [&_.p-password]:!flex [&_.p-password-input]:!w-full" toggleMask
              :class="{ 'p-invalid': errors.password }" />
          </div>
          <small class="text-red-500 text-sm mt-1 block" v-if="errors.password">{{ errors.password }}</small>
        </div>

        <div class="flex flex-col gap-4 mt-8">
          <Button label="Entrar" class="p-button-primary w-full" @click="handleLogin" />
          <Button label="Registrar" class="p-button-secondary w-full" @click="handleRegister" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '../stores/auth'
import { loginSchema, type LoginFormData } from '../validations/loginSchema'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const formData = reactive<LoginFormData>({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const clearErrors = () => {
  errors.email = ''
  errors.password = ''
}

const handleValidation = (isRegistering = false) => {
  clearErrors()
  const result = loginSchema.safeParse(formData)

  if (!result.success && isRegistering) {
    result.error.errors.forEach((error) => {
      const field = error.path[0] as keyof typeof errors
      errors[field] = error.message
    })
    return false
  }
  return true
}

const handleLogin = async () => {
  clearErrors()
  const success = authStore.login(formData)

  if (success) {
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Login realizado com sucesso',
      life: 3000
    })
    router.push('/orcamentos')
  } else {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Email ou senha inválidos',
      life: 3000
    })
  }
}

const handleRegister = async () => {
  if (!handleValidation(true)) return

  const success = authStore.register(formData)
  if (success) {
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Conta criada com sucesso! Agora você pode fazer login.',
      life: 3000
    })
    formData.email = ''
    formData.password = ''
  } else {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Este email já está cadastrado',
      life: 3000
    })
  }
}
</script>
