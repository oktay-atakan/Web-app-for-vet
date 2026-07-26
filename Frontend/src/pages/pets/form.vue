<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="7">
        <div class="d-flex align-center mb-4">
          <v-btn icon="mdi-arrow-left" variant="text" to="/pets" />
          <h1 class="text-h4 ml-2">
            {{ isNew ? 'New Pet' : 'Pet' }}
          </h1>
        </div>

        <v-alert v-if="errorMessage" class="mb-4" type="error">
          {{ errorMessage }}
        </v-alert>

        <v-card class="mb-6">
          <v-card-text>
            <v-form @submit.prevent="handleSave">
              <v-select
                v-if="isNew"
                v-model="form.customerId"
                item-title="full_name"
                item-value="id"
                :items="customers"
                label="Owner"
                required
                variant="outlined"
              />
              <v-text-field
                v-else
                label="Owner"
                :model-value="ownerName"
                readonly
                variant="outlined"
              />

              <v-text-field
                v-model="form.name"
                label="Name"
                :readonly="!canWrite"
                required
                variant="outlined"
              />
              <v-text-field
                v-model="form.species"
                label="Species"
                :readonly="!canWrite"
                required
                variant="outlined"
              />
              <v-text-field
                v-model="form.breed"
                label="Breed"
                :readonly="!canWrite"
                variant="outlined"
              />
              <v-text-field
                v-model="form.birthDate"
                label="Birth Date"
                :readonly="!canWrite"
                type="date"
                variant="outlined"
              />
              <v-text-field
                v-model.number="form.weightKg"
                label="Weight (kg)"
                :readonly="!canWrite"
                step="0.1"
                type="number"
                variant="outlined"
              />
              <v-textarea
                v-model="form.notes"
                label="Notes"
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

        <v-card v-if="!isNew && procedures !== null">
          <v-card-title class="d-flex align-center">
            Procedure History
            <v-spacer />
            <v-btn v-if="canManageProcedures" size="small" variant="tonal" @click="openProcedureDialog()">
              Add Procedure
            </v-btn>
          </v-card-title>
          <v-list v-if="procedures.length">
            <v-list-item
              v-for="procedure in procedures"
              :key="procedure.id"
              :subtitle="procedureSubtitle(procedure)"
              :title="procedure.name"
            >
              <template v-if="canManageProcedures" #append>
                <v-btn icon="mdi-pencil" size="small" variant="text" @click="openProcedureDialog(procedure)" />
                <v-btn
                  v-if="auth.role === 'admin'"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="handleDeleteProcedure(procedure.id)"
                />
              </template>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-medium-emphasis">
            No procedures logged yet.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title>Delete Pet?</v-card-title>
        <v-card-text>This cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDelete = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="handleDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="procedureDialog" max-width="500">
      <v-card>
        <v-card-title>{{ procedureForm.id ? 'Edit Procedure' : 'Add Procedure' }}</v-card-title>
        <v-card-text>
          <v-alert v-if="procedureError" class="mb-4" type="error">{{ procedureError }}</v-alert>
          <v-select
            v-model="procedureForm.type"
            :items="['vaccination', 'checkup', 'treatment', 'surgery', 'other']"
            label="Type"
            required
            variant="outlined"
          />
          <v-text-field
            v-model="procedureForm.name"
            label="Name"
            required
            variant="outlined"
          />
          <v-text-field
            v-model="procedureForm.dateAdministered"
            label="Date Administered"
            required
            type="date"
            variant="outlined"
          />
          <v-text-field
            v-model="procedureForm.nextDueDate"
            label="Next Due Date"
            type="date"
            variant="outlined"
          />
          <v-textarea
            v-model="procedureForm.notes"
            label="Notes"
            rows="2"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="procedureDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="savingProcedure" @click="handleSaveProcedure">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { createPet, deletePet, getPet, updatePet } from '@/services/pets'
  import { listCustomers } from '@/services/customers'
  import { createProcedure, deleteProcedure, updateProcedure } from '@/services/procedures'

  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()

  const isNew = computed(() => !route.params.id)
  const canWrite = computed(() => ['admin', 'vet'].includes(auth.role))
  const canDelete = computed(() => auth.role === 'admin')
  const canManageProcedures = computed(() => ['admin', 'vet'].includes(auth.role))

  const form = reactive({
    customerId: null,
    name: '',
    species: '',
    breed: '',
    birthDate: '',
    weightKg: null,
    notes: '',
  })
  const ownerName = ref('')
  const customers = ref([])
  // null until loaded; stays null for staff, since the backend omits this
  // field entirely from their GET /pets/:id response.
  const procedures = ref(null)

  const saving = ref(false)
  const deleting = ref(false)
  const confirmDelete = ref(false)
  const errorMessage = ref('')

  async function loadPet () {
    if (isNew.value) {
      customers.value = await listCustomers()
      return
    }
    try {
      const pet = await getPet(route.params.id)
      form.name = pet.name
      form.species = pet.species
      form.breed = pet.breed
      form.birthDate = pet.birth_date ? pet.birth_date.slice(0, 10) : ''
      form.weightKg = pet.weight_kg
      form.notes = pet.notes
      procedures.value = pet.procedures ?? null

      const [owner] = await Promise.all([
        listCustomers().then((list) => list.find((c) => c.id === pet.customer_id)),
      ])
      ownerName.value = owner?.full_name || `#${pet.customer_id}`
    } catch {
      errorMessage.value = 'Failed to load pet'
    }
  }

  async function handleSave () {
    saving.value = true
    errorMessage.value = ''
    try {
      if (isNew.value) {
        const created = await createPet(form)
        router.push(`/pets/${created.id}`)
      } else {
        await updatePet(route.params.id, form)
      }
    } catch (err) {
      errorMessage.value = err.response?.data?.error?.message || 'Failed to save pet'
    } finally {
      saving.value = false
    }
  }

  async function handleDelete () {
    deleting.value = true
    errorMessage.value = ''
    try {
      await deletePet(route.params.id)
      router.push('/pets')
    } catch (err) {
      errorMessage.value = err.response?.data?.error?.message || 'Failed to delete pet'
      confirmDelete.value = false
    } finally {
      deleting.value = false
    }
  }

  function procedureSubtitle (procedure) {
    const parts = [procedure.type, procedure.date_administered?.slice(0, 10)]
    if (procedure.next_due_date) {
      parts.push(`next due ${procedure.next_due_date.slice(0, 10)}`)
    }
    return parts.join(' · ')
  }

  const procedureDialog = ref(false)
  const savingProcedure = ref(false)
  const procedureError = ref('')
  const procedureForm = reactive({
    id: null,
    type: 'checkup',
    name: '',
    dateAdministered: '',
    nextDueDate: '',
    notes: '',
  })

  function openProcedureDialog (procedure) {
    procedureError.value = ''
    if (procedure) {
      procedureForm.id = procedure.id
      procedureForm.type = procedure.type
      procedureForm.name = procedure.name
      procedureForm.dateAdministered = procedure.date_administered?.slice(0, 10) || ''
      procedureForm.nextDueDate = procedure.next_due_date?.slice(0, 10) || ''
      procedureForm.notes = procedure.notes || ''
    } else {
      procedureForm.id = null
      procedureForm.type = 'checkup'
      procedureForm.name = ''
      procedureForm.dateAdministered = ''
      procedureForm.nextDueDate = ''
      procedureForm.notes = ''
    }
    procedureDialog.value = true
  }

  async function handleSaveProcedure () {
    savingProcedure.value = true
    procedureError.value = ''
    try {
      // performedBy defaults to the logged-in vet/admin — listing users to
      // pick a different one would need the admin-only /api/users endpoint,
      // which a vet can't call, so self-attribution keeps this workable for both roles.
      const payload = { ...procedureForm, performedBy: auth.user.id }
      if (procedureForm.id) {
        await updateProcedure(procedureForm.id, payload)
      } else {
        await createProcedure(route.params.id, payload)
      }
      procedureDialog.value = false
      await loadPet()
    } catch (err) {
      procedureError.value = err.response?.data?.error?.message || 'Failed to save procedure'
    } finally {
      savingProcedure.value = false
    }
  }

  async function handleDeleteProcedure (id) {
    try {
      await deleteProcedure(id)
      await loadPet()
    } catch (err) {
      errorMessage.value = err.response?.data?.error?.message || 'Failed to delete procedure'
    }
  }

  onMounted(loadPet)
</script>