import api from './api'

export function listPets ({ customerId } = {}) {
  return api.get('/pets', { params: { customerId } }).then((res) => res.data)
}

export function getPet (id) {
  return api.get(`/pets/${id}`).then((res) => res.data)
}

export function createPet (payload) {
  return api.post('/pets', payload).then((res) => res.data)
}

export function updatePet (id, payload) {
  return api.put(`/pets/${id}`, payload).then((res) => res.data)
}

export function deletePet (id) {
  return api.delete(`/pets/${id}`)
}