
const token0 = require('./token0.json');
const token1 = require('./token1.json');
const getReserves = require('./getReserves.json');
const factory = require('./factory.json');

module.exports = {
  token0,
  token1,
  getReserves,
  ...factory,
}
