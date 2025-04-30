<script setup lang="ts">
import MenuBarComponent from './components/MenubarComponent.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
  <MenuBarComponent v-if="!isLoginPage" />
  <router-view />
</template>
