<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Customers</h1>
      <v-spacer />
      <v-btn v-if="canWrite" color="primary" prepend-icon="mdi-plus" to="/customers/new">
        New Customer
      </v-btn>
    </div>

    <v-alert v-if="errorMessage" class="mb-4" type="error">
      {{ errorMessage }}
    </v-alert>

    <v-data-table
      :headers="headers"
      :items="customers"
      :loading="loading"
      @click:row="(event, { item }) => $router.push(`/customers/${item.id}`)"
    >
      <template #item.phone="{ value }">
        {{ value || '—' }}
      </template>
      <template #item.email="{ value }">
        {{ value || '—' }}
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { listCustomers } from '@/services/customers'

  const auth = useAuthStore()
  const canWrite = computed(() => ['admin', 'vet'].includes(auth.role))

  const customers = ref([])
  const loading = ref(false)
  const errorMessage = ref('')

  const headers = [
    { title: 'Name', key: 'full_name' },
    { title: 'Phone', key: 'phone' },
    { title: 'Email', key: 'email' },
  ]

  async function loadCustomers () {
    loading.value = true
    errorMessage.value = ''
    try {
      customers.value = await listCustomers()
    } catch {
      errorMessage.value = 'Failed to load customers'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadCustomers)
</script>