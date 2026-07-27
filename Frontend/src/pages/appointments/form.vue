<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <div class="d-flex align-center mb-4">
          <v-btn icon="mdi-arrow-left" variant="text" to="/appointments" />
          <h1 class="text-h4 ml-2">
            {{ isNew ? 'New Appointment' : 'Appointment' }}
          </h1>
        </div>

        <v-alert v-if="errorMessage" class="mb-4" type="error">
          {{ errorMessage }}
        </v-alert>

        <v-card>
          <v-card-text>
            <v-form @submit.prevent="handleSave">
              <v-select
                v-model="form.customerId"
                item-title="full_name"
                item-value="id"
                :items="customers"
                label="Customer"
                required
                variant="outlined"
                @update:model-value="onCustomerChange"
              />
              <v-select
                v-model="form.petId"
                clearable
                :disabled="!form.customerId"
                item-title="name"
                item-value="id"
                :items="petsForCustomer"
                label="Pet (optional)"
                variant="outlined"
              />
              <v-text-field
                v-model="form.scheduledAt"
                label="Date & Time"
                required
                type="datetime-local"
                variant="outlined"
              />
              <v-select
                v-model="form.status"
                :items="['scheduled', 'completed', 'cancelled', 'no_show']"
                label="Status"
                variant="outlined"
              />
              <v-text-field
                v-model="form.reason"
                label="Reason"
                variant="outlined"
              />

              <div class="d-flex ga-2">
                <v-btn color="primary" :loading="saving" type="submit">
                  Save
                </v-btn>
                <v-btn v-if="!isNew && canDelete" color="error" variant="text" @click="confirmDelete = true">
                  Delete
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title>Delete Appointment?</v-card-title>
        <v-card-text>This cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDelete = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="handleDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import {
    createAppointment,
    deleteAppointment,
    getAppointment,
    updateAppointment,
  } from '@/services/appointments'
  import { listCustomers } from '@/services/customers'
  import { listPets } from '@/services/pets'
  import { getErrorMessage } from '@/utils/errors'

  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()

  const isNew = computed(() => !route.params.id)
  // Vet is the one role excluded from deleting/cancelling appointments outright.
  const canDelete = computed(() => ['admin', 'staff'].includes(auth.role))

  const customers = ref([])
  const petsForCustomer = ref([])

  const form = reactive({
    customerId: null,
    petId: null,
    scheduledAt: '',
    status: 'scheduled',
    reason: '',
  })
  // assignedTo (the vet) is intentionally not exposed here — picking one would
  // need GET /api/users, which is admin-only, so staff/vet couldn't populate
  // it anyway. Left unassigned; can be set later via an admin-only flow.

  const saving = ref(false)
  const deleting = ref(false)
  const confirmDelete = ref(false)
  const errorMessage = ref('')

  async function onCustomerChange (customerId) {
    form.petId = null
    petsForCustomer.value = customerId ? await listPets({ customerId }) : []
  }

  async function loadAppointment () {
    customers.value = await listCustomers()

    if (isNew.value) {
      return
    }
    try {
      const appointment = await getAppointment(route.params.id)
      form.customerId = appointment.customer_id
      form.petId = appointment.pet_id
      // MySQL returns DATETIME as "YYYY-MM-DD HH:MM:SS"; the datetime-local
      // input needs a "T" separator instead of a space.
      form.scheduledAt = appointment.scheduled_at.replace(' ', 'T').slice(0, 16)
      form.status = appointment.status
      form.reason = appointment.reason
      petsForCustomer.value = await listPets({ customerId: appointment.customer_id })
    } catch {
      errorMessage.value = 'Failed to load appointment'
    }
  }

  async function handleSave () {
    saving.value = true
    errorMessage.value = ''
    try {
      if (isNew.value) {
        const created = await createAppointment(form)
        router.push(`/appointments/${created.id}`)
      } else {
        await updateAppointment(route.params.id, form)
      }
    } catch (err) {
      errorMessage.value = getErrorMessage(err, 'Failed to save appointment')
    } finally {
      saving.value = false
    }
  }

  async function handleDelete () {
    deleting.value = true
    errorMessage.value = ''
    try {
      await deleteAppointment(route.params.id)
      router.push('/appointments')
    } catch (err) {
      errorMessage.value = getErrorMessage(err, 'Failed to delete appointment')
      confirmDelete.value = false
    } finally {
      deleting.value = false
    }
  }

  onMounted(loadAppointment)
</script>