<template>
  <div class="p-3">
    <Menubar :model="items">
      <template #start>
        <img src="../assets/logo-colorido.png" alt="logo" class="block dark:hidden h-5 w-20">
        <img src="../assets/logo-dark.png" alt="logo" class="hidden dark:block h-5 w-20">

      </template>

    </Menubar>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import Menubar from 'primevue/menubar'


import { ref } from 'vue'

const router = useRouter()

const items = ref([
  {
    label: 'Orçamentos',
    command: () => {
      router.push('/')
    }
  },
  {
    label: 'Novo Orçamento',
    command: () => {
      router.push('/novo-orcamento')
    }
  }
]);
</script>
<style scoped>
:deep(.p-menubar-button) {
  order: -1 !important;
}
</style>