const { compoundExports } = require("../helper/compound");
const unitroller = "0x537A09Fd99Fc7eF737d297cDEeAB3b7f9602308c";

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2023-06-11') / 1e3), 'Project rugged'],
  ],
  methodology:
    "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  arbitrum: {
    ...compoundExports(unitroller, "arbitrum"),
  },
};