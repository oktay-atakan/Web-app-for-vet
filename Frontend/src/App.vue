<template>
  <v-app>
    <template v-if="auth.isAuthenticated">
      <v-app-bar color="primary" density="comfortable">
        <v-app-bar-nav-icon @click="drawer = !drawer" />
        <v-toolbar-title>VetApp</v-toolbar-title>
        <v-spacer />
        <span class="text-body-2 mr-4">{{ auth.user?.fullName }} ({{ auth.user?.role }})</span>
        <v-btn icon="mdi-logout" @click="handleLogout" />
      </v-app-bar>

      <v-navigation-drawer v-model="drawer">
        <v-list nav>
          <v-list-item
            v-for="item in visibleNavItems"
            :key="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
          />
        </v-list>
      </v-navigation-drawer>
    </template>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  const drawer = ref(true)
  const auth = useAuthStore()
  const router = useRouter()

  // Convenience only — the backend enforces the real permission matrix.
  // This just avoids showing menu entries a role can't act on.
  const navItems = [
    { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/', roles: ['admin', 'vet', 'staff'] },
    { title: 'Customers', icon: 'mdi-account-group', to: '/customers', roles: ['admin', 'vet', 'staff'] },
    { title: 'Pets', icon: 'mdi-paw', to: '/pets', roles: ['admin', 'vet', 'staff'] },
    { title: 'Appointments', icon: 'mdi-calendar-clock', to: '/appointments', roles: ['admin', 'vet', 'staff'] },
    { title: 'Users', icon: 'mdi-account-cog', to: '/users', roles: ['admin'] },
  ]

  const visibleNavItems = computed(() =>
    navItems.filter((item) => item.roles.includes(auth.role))
  )

  function handleLogout () {
    auth.logout()
    router.push('/login')
  }
</script>