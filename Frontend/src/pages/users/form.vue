<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <div class="d-flex align-center mb-4">
          <v-btn icon="mdi-arrow-left" variant="text" to="/users" />
          <h1 class="text-h4 ml-2">
            {{ isNew ? 'New User' : 'User' }}
          </h1>
        </div>

        <v-alert v-if="errorMessage" class="mb-4" type="error">
          {{ errorMessage }}
        </v-alert>

        <v-card>
          <v-card-text>
            <v-form @submit.prevent="handleSave">
              <v-text-field
                v-if="isNew"
                v-model="form.email"
                label="Email"
                required
                type="email"
                variant="outlined"
              />
              <v-text-field
                v-else
                label="Email"
                :model-value="form.email"
                readonly
                variant="outlined"
              />

              <v-text-field
                v-if="isNew"
                v-model="form.password"
                hint="At least 8 characters"
                label="Password"
                required
                type="password"
                variant="outlined"
              />

              <v-text-field
                v-model="form.fullName"
                label="Full Name"
                required
                variant="outlined"
              />

              <v-select
                v-model="form.role"
                :items="['admin', 'vet', 'staff']"
                label="Role"
                required
                variant="outlined"
              />

              <v-switch
                v-if="!isNew"
                v-model="form.isActive"
                color="primary"
                :label="form.isActive ? 'Active' : 'Disabled'"
              />

              <v-btn color="primary" :loading="saving" type="submit">
                Save
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { createUser, getUser, updateUser } from '@/services/users'
  import { getErrorMessage } from '@/utils/errors'

  const route = useRoute()
  const router = useRouter()

  const isNew = computed(() => !route.params.id)

  const form = reactive({
    email: '',
    password: '',
    fullName: '',
    role: 'staff',
    isActive: true,
  })
  const saving = ref(false)
  const errorMessage = ref('')

  async function loadUser () {
    if (isNew.value) {
      return
    }
    try {
      const user = await getUser(route.params.id)
      form.email = user.email
      form.fullName = user.fullName
      form.role = user.role
      form.isActive = user.isActive
    } catch {
      errorMessage.value = 'Failed to load user'
    }
  }

  async function handleSave () {
    saving.value = true
    errorMessage.value = ''
    try {
      if (isNew.value) {
        const created = await createUser(form)
        router.push(`/users/${created.id}`)
      } else {
        await updateUser(route.params.id, {
          fullName: form.fullName,
          role: form.role,
          isActive: form.isActive,
        })
      }
    } catch (err) {
      errorMessage.value = getErrorMessage(err, 'Failed to save user')
    } finally {
      saving.value = false
    }
  }

  onMounted(loadUser)
</script>