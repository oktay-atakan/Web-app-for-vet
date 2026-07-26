<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Users</h1>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" to="/users/new">
        New User
      </v-btn>
    </div>

    <v-alert v-if="errorMessage" class="mb-4" type="error">
      {{ errorMessage }}
    </v-alert>

    <v-data-table
      :headers="headers"
      :items="users"
      :loading="loading"
      @click:row="(event, { item }) => $router.push(`/users/${item.id}`)"
    >
      <template #item.isActive="{ value }">
        <v-chip :color="value ? 'green' : 'grey'" size="small">
          {{ value ? 'Active' : 'Disabled' }}
        </v-chip>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { listUsers } from '@/services/users'

  const users = ref([])
  const loading = ref(false)
  const errorMessage = ref('')

  const headers = [
    { title: 'Email', key: 'email' },
    { title: 'Name', key: 'fullName' },
    { title: 'Role', key: 'role' },
    { title: 'Status', key: 'isActive' },
  ]

  async function loadUsers () {
    loading.value = true
    errorMessage.value = ''
    try {
      users.value = await listUsers()
    } catch {
      errorMessage.value = 'Failed to load users'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadUsers)
</script>