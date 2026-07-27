<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Appointments</h1>
      <v-spacer />
      <v-select
        v-model="statusFilter"
        class="mr-4"
        clearable
        density="compact"
        hide-details
        :items="['scheduled', 'completed', 'cancelled', 'no_show']"
        label="Status"
        style="max-width: 200px"
        variant="outlined"
        @update:model-value="loadAppointments"
      />
      <v-btn color="primary" prepend-icon="mdi-plus" to="/appointments/new">
        New Appointment
      </v-btn>
    </div>

    <v-alert v-if="errorMessage" class="mb-4" type="error">
      {{ errorMessage }}
    </v-alert>

    <v-data-table
      :headers="headers"
      :items="appointments"
      :loading="loading"
      @click:row="(event, { item }) => $router.push(`/appointments/${item.id}`)"
    >
      <template #item.scheduled_at="{ value }">
        {{ new Date(value.replace(' ', 'T')).toLocaleString() }}
      </template>
      <template #item.customer_id="{ value }">
        {{ customerNameById[value] || `#${value}` }}
      </template>
      <template #item.status="{ value }">
        <v-chip :color="statusColor(value)" size="small">{{ value }}</v-chip>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { listAppointments } from '@/services/appointments'
  import { listCustomers } from '@/services/customers'

  const appointments = ref([])
  const customerNameById = ref({})
  const statusFilter = ref(null)
  const loading = ref(false)
  const errorMessage = ref('')

  const headers = [
    { title: 'When', key: 'scheduled_at' },
    { title: 'Customer', key: 'customer_id' },
    { title: 'Status', key: 'status' },
    { title: 'Reason', key: 'reason' },
  ]

  function statusColor (status) {
    return {
      scheduled: 'blue',
      completed: 'green',
      cancelled: 'grey',
      no_show: 'red',
    }[status] || 'grey'
  }

  async function loadAppointments () {
    loading.value = true
    errorMessage.value = ''
    try {
      const [appointmentsData, customersData] = await Promise.all([
        listAppointments({ status: statusFilter.value }),
        listCustomers(),
      ])
      appointments.value = appointmentsData
      customerNameById.value = Object.fromEntries(
        customersData.map((c) => [c.id, c.full_name])
      )
    } catch {
      errorMessage.value = 'Failed to load appointments'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadAppointments)
</script>