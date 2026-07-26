import api from './api'

export function listAppointments ({ status, customerId } = {}) {
  return api.get('/appointments', { params: { status, customerId } }).then((res) => res.data)
}

export function getAppointment (id) {
  return api.get(`/appointments/${id}`).then((res) => res.data)
}

export function createAppointment (payload) {
  return api.post('/appointments', payload).then((res) => res.data)
}

export function updateAppointment (id, payload) {
  return api.put(`/appointments/${id}`, payload).then((res) => res.data)
}

export function deleteAppointment (id) {
  return api.delete(`/appointments/${id}`)
}