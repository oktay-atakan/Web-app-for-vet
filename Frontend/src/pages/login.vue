<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="4">
          <v-card-title class="text-h5 pt-6 text-center">
            VetApp
          </v-card-title>
          <v-card-subtitle class="text-center pb-4">
            Sign in to continue
          </v-card-subtitle>

          <v-card-text>
            <v-form @submit.prevent="handleSubmit">
              <v-alert
                v-if="errorMessage"
                class="mb-4"
                closable
                type="error"
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <v-text-field
                v-model="email"
                autofocus
                label="Email"
                required
                type="email"
                variant="outlined"
              />

              <v-text-field
                v-model="password"
                label="Password"
                required
                type="password"
                variant="outlined"
              />

              <v-btn
                block
                color="primary"
                :loading="loading"
                size="large"
                type="submit"
              >
                Sign In
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { getErrorMessage } from '@/utils/errors'

  const email = ref('')
  const password = ref('')
  const loading = ref(false)
  const errorMessage = ref('')

  const auth = useAuthStore()
  const router = useRouter()

  async function handleSubmit () {
    errorMessage.value = ''
    loading.value = true
    try {
      await auth.login(email.value, password.value)
      router.push('/')
    } catch (err) {
      errorMessage.value = getErrorMessage(err, 'Login failed')
    } finally {
      loading.value = false
    }
  }
</script>