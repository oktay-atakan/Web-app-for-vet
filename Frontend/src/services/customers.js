import api from './api'

export function listCustomers () {
  return api.get('/customers').then((res) => res.data)
}

export function getCustomer (id) {
  return api.get(`/customers/${id}`).then((res) => res.data)
}

export function createCustomer (payload) {
  return api.post('/customers', payload).then((res) => res.data)
}

export function updateCustomer (id, payload) {
  return api.put(`/customers/${id}`, payload).then((res) => res.data)
}

export function deleteCustomer (id) {
  return api.delete(`/customers/${id}`)
}