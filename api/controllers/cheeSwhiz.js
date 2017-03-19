const bodyParser = require('body-parser');

function allCheese(req, res) {
  const knex = require('../../knex.js');
  return knex('cheeses')
  .join('animals', 'animals.id', '=', 'cheeses.animal_id')
  .join('firmness', 'firmness.id', '=', 'cheeses.firmness_id')
  .select('cheeses.id', 'cheeses.name', 'animals.animal', 'firmness.firmness')
  .orderBy('id', 'asc')
  .then((cheeses) => {
    res.set('Content-Type', 'application/json');
    res.status(200).json(cheeses);
  }).catch((err) => {
    console.error(err);
  });
}

function postCheese(req, res) {
  const knex = require('../../knex.js'),
        name = req.body.name,
        animal = req.body.animal_id,
        firmness = req.body.firmness_id;
  if (!name || !animal || !firmness || Number.isNaN(animal) || Number.isNaN(firmness)) {
    res.set('Content-Type', 'plain')
    if (!name ) { res.status(400).send('Name must not be blank!') }
    else if (!animal) { res.status(400).send('Animal must not be blank!') }
    else if (!firmness) { res.status(400).send('Firmness must not be blank!') }
    else if (Number.isNaN(animal)) { res.status(400).send('Animal must be an integer matching its correct ID in the animals table.') }
    else if (Number.isNaN(firmness)) { res.status(400).send('Firmness must be an integer matching its correct ID in the firmness table.') }
  }
  const newCheese = {
    name: req.body.name,
    animal_id: req.body.animal_id,
    firmness_id: req.body.firmness_id,
    user_id: req.body.user_id
  }
  knex('cheeses').where('cheeses.name', name)
  .then((oneOrNone) => {
    if (oneOrNone.length > 0) {
      res.set('Content-Type', 'plain');
      res.status(400).send('Cheese already exists!');
    }
  }).then(() => {
    return knex('cheeses').insert(newCheese, '*');
  }).then((cheese) => {
    res.set('Content-Type', 'application/json');
    res.status(200).json(cheese);
  }).catch((err) => {
    console.error(err);
  });
}

function updateCheese(req, res) {
  const knex = require('../../knex.js'),
        id = req.params.id;
  if (!id) {
    res.set('Content-Type', 'plain');
    res.status(400).send('Please provide an integer that matches the ID of the cheese you wish to update.');
  }
  const updatedVersion = {
    id: id,
    name: req.body.name,
    animal_id: req.body.animal_id,
    firmness_id: req.body.firmness_id,
    user_id: req.body.user_id
  }
  knex('cheeses').where('cheeses.id', id)
  .then((oneOrNone) => {
    if (oneOrNone.length === 0) {
      res.set('Content-Type', 'plain');
      res.status(400).send('Cheese not found!');
    }
  }).then(() => {
    return knex('cheeses')
    .where('cheeses.id', id)
    .update(updatedVersion);
  }).then((cheese) => {
    res.set('Content-Type', 'application/json');
    res.status(200).json(cheese);
  }).catch((err) => {
    console.error(err);
  });
}

module.exports = {
  allCheese: allCheese,
  postCheese: postCheese,
  updatedCheese: updateCheese
}
