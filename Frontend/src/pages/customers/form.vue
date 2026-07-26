<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <div class="d-flex align-center mb-4">
          <v-btn icon="mdi-arrow-left" variant="text" to="/customers" />
          <h1 class="text-h4 ml-2">
            {{ isNew ? 'New Customer' : 'Customer' }}
          </h1>
        </div>

        <v-alert v-if="errorMessage" class="mb-4" type="error">
          {{ errorMessage }}
        </v-alert>

        <v-card>
          <v-card-text>
            <v-form @submit.prevent="handleSave">
              <v-text-field
                v-model="form.fullName"
                label="Full Name"
                :readonly="!canWrite"
                required
                variant="outlined"
              />
              <v-text-field
                v-model="form.phone"
                label="Phone"
                :readonly="!canWrite"
                variant="outlined"
              />
              <v-text-field
                v-model="form.email"
                label="Email"
                :readonly="!canWrite"
                type="email"
                variant="outlined"
              />
              <v-textarea
                v-model="form.address"
                label="Address"
                :readonly="!canWrite"
                rows="2"
                variant="outlined"
              />

              <div v-if="canWrite" class="d-flex ga-2">
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
        <v-card-title>Delete Customer?</v-card-title>
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
  import { createCustomer, deleteCustomer, getCustomer, updateCustomer } from '@/services/customers'

  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()

  const isNew = computed(() => !route.params.id)
  const canWrite = computed(() => ['admin', 'vet'].includes(auth.role))
  const canDelete = computed(() => auth.role === 'admin')

  const form = reactive({ fullName: '', phone: '', email: '', address: '' })
  const saving = ref(false)
  const deleting = ref(false)
  const confirmDelete = ref(false)
  const errorMessage = ref('')

  async function loadCustomer () {
    if (isNew.value) {
      return
    }
    try {
      const customer = await getCustomer(route.params.id)
      form.fullName = customer.full_name
      form.phone = customer.phone
      form.email = customer.email
      form.address = customer.address
    } catch {
      errorMessage.value = 'Failed to load customer'
    }
  }

  async function handleSave () {
    saving.value = true
    errorMessage.value = ''
    try {
      if (isNew.value) {
        const created = await createCustomer(form)
        router.push(`/customers/${created.id}`)
      } else {
        await updateCustomer(route.params.id, form)
      }
    } catch (err) {
      errorMessage.value = err.response?.data?.error?.message || 'Failed to save customer'
    } finally {
      saving.value = false
    }
  }

  async function handleDelete () {
    deleting.value = true
    errorMessage.value = ''
    try {
      await deleteCustomer(route.params.id)
      router.push('/customers')
    } catch (err) {
      errorMessage.value = err.response?.data?.error?.message || 'Failed to delete customer'
      confirmDelete.value = false
    } finally {
      deleting.value = false
    }
  }

  onMounted(loadCustomer)
</script>