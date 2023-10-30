const { compoundExports } = require("../helper/compound");
const { staking } = require("../helper/staking");

const unitroller = "0xFcD7D41D5cfF03C7f6D573c9732B0506C72f5C72";

module.exports = {
  methodology: "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  kava: {
    ...compoundExports(unitroller, "kava"),
  },
}