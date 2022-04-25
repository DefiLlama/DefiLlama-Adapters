const BloodToken = require("./BloodToken.json");
const Fountain = require("./Fountain.json");
const PriceCalculator = require("./PriceCalculator.json");

module.exports = {
  BloodToken: BloodToken.abi,
  Fountain: Fountain.abi,
  PriceCalculator: PriceCalculator.abi,
};
