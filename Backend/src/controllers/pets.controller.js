const petsService = require('../services/pets.service');

async function list(req, res) {
  const { customerId } = req.query;
  const pets = await petsService.listPets({ customerId });
  res.json(pets);
}

async function getOne(req, res) {
  const pet = await petsService.getPet(req.params.id, req.user.role);
  res.json(pet);
}

async function create(req, res) {
  const { customerId, name, species, breed, birthDate, weightKg, notes } = req.body;
  const pet = await petsService.createPet({
    customerId,
    name,
    species,
    breed,
    birthDate,
    weightKg,
    notes,
  });
  res.status(201).json(pet);
}

async function update(req, res) {
  const { name, species, breed, birthDate, weightKg, notes } = req.body;
  const pet = await petsService.updatePet(req.params.id, {
    name,
    species,
    breed,
    birthDate,
    weightKg,
    notes,
  });
  res.json(pet);
}

async function remove(req, res) {
  await petsService.deletePet(req.params.id);
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };