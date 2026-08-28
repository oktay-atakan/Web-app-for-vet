const appointmentsService = require('../services/appointments.service');

async function list(req, res) {
  const { status, customerId } = req.query;
  const appointments = await appointmentsService.listAppointments({ status, customerId });
  res.json(appointments);
}

async function getOne(req, res) {
  const appointment = await appointmentsService.getAppointment(req.params.id);
  res.json(appointment);
}

async function create(req, res) {
  const { customerId, petId, scheduledAt, status, reason, assignedTo } = req.body;
  const appointment = await appointmentsService.createAppointment({
    customerId,
    petId,
    scheduledAt,
    status,
    reason,
    assignedTo,
  });
  res.status(201).json(appointment);
}

async function update(req, res) {
  const { petId, scheduledAt, status, reason, assignedTo } = req.body;
  const appointment = await appointmentsService.updateAppointment(req.params.id, {
    petId,
    scheduledAt,
    status,
    reason,
    assignedTo,
  });
  res.json(appointment);
}

async function remove(req, res) {
  await appointmentsService.deleteAppointment(req.params.id);
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };