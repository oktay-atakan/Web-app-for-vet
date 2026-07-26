<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Pets</h1>
      <v-spacer />
      <v-btn v-if="canWrite" color="primary" prepend-icon="mdi-plus" to="/pets/new">
        New Pet
      </v-btn>
    </div>

    <v-alert v-if="errorMessage" class="mb-4" type="error">
      {{ errorMessage }}
    </v-alert>

    <v-data-table
      :headers="headers"
      :items="pets"
      :loading="loading"
      @click:row="(event, { item }) => $router.push(`/pets/${item.id}`)"
    >
      <template #item.customer_id="{ value }">
        {{ customerNameById[value] || `#${value}` }}
      </template>
      <template #item.breed="{ value }">
        {{ value || '—' }}
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { listPets } from '@/services/pets'
  import { listCustomers } from '@/services/customers'

  const auth = useAuthStore()
  const canWrite = computed(() => ['admin', 'vet'].includes(auth.role))

  const pets = ref([])
  const customerNameById = ref({})
  const loading = ref(false)
  const errorMessage = ref('')

  const headers = [
    { title: 'Name', key: 'name' },
    { title: 'Species', key: 'species' },
    { title: 'Breed', key: 'breed' },
    { title: 'Owner', key: 'customer_id' },
  ]

  async function loadPets () {
    loading.value = true
    errorMessage.value = ''
    try {
      const [petsData, customersData] = await Promise.all([listPets(), listCustomers()])
      pets.value = petsData
      customerNameById.value = Object.fromEntries(
        customersData.map((c) => [c.id, c.full_name])
      )
    } catch {
      errorMessage.value = 'Failed to load pets'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadPets)
</script>