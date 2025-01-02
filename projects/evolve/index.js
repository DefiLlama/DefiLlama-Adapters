const { tarotHelper } = require("../tarot/tarotHelper");

const config = {
  cronos: {
    factories: ["0xb8b48e97cd037987de138b978df265d873333a3b"],
  },
};

module.exports = {
  deadFrom: '2023-02-27',
}

tarotHelper(module.exports, config, { tarotSymbol: 'vEvolve'})

module.exports.cronos.borrowed = () => ({}) // bad debt
