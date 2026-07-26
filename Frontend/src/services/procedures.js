import api from './api'

export function createProcedure (petId, payload) {
  return api.post(`/pets/${petId}/procedures`, payload).then((res) => res.data)
}

export function updateProcedure (id, payload) {
  return api.put(`/procedures/${id}`, payload).then((res) => res.data)
}

export function deleteProcedure (id) {
  return api.delete(`/procedures/${id}`)
}