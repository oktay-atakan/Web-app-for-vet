import api from './api'

export function listUsers () {
  return api.get('/users').then((res) => res.data)
}

export function getUser (id) {
  return api.get(`/users/${id}`).then((res) => res.data)
}

export function createUser (payload) {
  return api.post('/users', payload).then((res) => res.data)
}

export function updateUser (id, payload) {
  return api.put(`/users/${id}`, payload).then((res) => res.data)
}