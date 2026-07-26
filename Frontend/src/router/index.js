/**
 * router/index.js
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Index from '@/pages/index.vue'
import Login from '@/pages/login.vue'
import Forbidden from '@/pages/forbidden.vue'
import CustomersList from '@/pages/customers/list.vue'
import CustomerForm from '@/pages/customers/form.vue'
import PetsList from '@/pages/pets/list.vue'
import PetForm from '@/pages/pets/form.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Index,
      // roles omitted = any authenticated user
    },
    {
      path: '/login',
      component: Login,
      meta: { public: true },
    },
    {
      path: '/forbidden',
      component: Forbidden,
      meta: { public: true },
    },
    {
      path: '/customers',
      component: CustomersList,
      meta: { roles: ['admin', 'vet', 'staff'] },
    },
    {
      path: '/customers/new',
      component: CustomerForm,
      meta: { roles: ['admin', 'vet'] },
    },
    {
      path: '/customers/:id',
      component: CustomerForm,
      meta: { roles: ['admin', 'vet', 'staff'] },
    },
    {
      path: '/pets',
      component: PetsList,
      meta: { roles: ['admin', 'vet', 'staff'] },
    },
    {
      path: '/pets/new',
      component: PetForm,
      meta: { roles: ['admin', 'vet'] },
    },
    {
      path: '/pets/:id',
      component: PetForm,
      meta: { roles: ['admin', 'vet', 'staff'] },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    return true
  }

  if (!auth.isAuthenticated) {
    return '/login'
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return '/forbidden'
  }

  return true
})

export default router
