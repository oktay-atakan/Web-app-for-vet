<template>
  <v-container>
    <h1 class="text-h4 mb-2">Dashboard</h1>
    <p class="text-body-1">
      Signed in as {{ auth.user?.fullName }} ({{ auth.user?.role }}).
    </p>
  </v-container>
</template>

<script setup>
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()
</script>