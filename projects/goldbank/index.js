const { compoundExports } = require("../helper/compound");
const unitroller = "0x537A09Fd99Fc7eF737d297cDEeAB3b7f9602308c";

module.exports = {
  hallmarks: [
    ['2023-06-11', 'Project rugged'],
  ],
  deadFrom: '2023-06-11',
  methodology:
    "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  arbitrum: {
    ...compoundExports(unitroller),
  },
};

module.exports.arbitrum.borrowed = () => ({}) // bad debt