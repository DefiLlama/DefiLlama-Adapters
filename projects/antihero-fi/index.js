const { compoundExports } = require("../helper/compound");
const { staking } = require("../helper/staking");

const unitroller = "0x3646bF53C17EbBE4ce5e389Cd3c73Bc818Ff7e46";

module.exports = {
  methodology:
    "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  arbitrum: {
    ...compoundExports(unitroller),
    staking: staking(
      [
        "0x2117E6449b3C50B70705bF1566383b1a94bd5192",
      ],
      "0x9d15bb4351E95A3FE213E48B410BA1aB7CF8Ce45"
    ),
  },
  deadFrom: "2023-08-27"
};

module.exports.arbitrum.borrowed = () => ({}) // bad debt