const { aaveExports } = require("../helper/aave");

const REGISTRY = "0x989CdA7ea2953F9AF743C7cc51B8fA71d156aE27";
const DATA_HELPERS = ["0x91e097513f45D4aA93E6acBa20272AA769fa9D27"];

const lending = aaveExports(
  "haven1",
  REGISTRY,
  undefined,
  DATA_HELPERS,
  { v3: true }
);

module.exports = {
  methodology: "Counts the tokens locked in Haven1 contracts that are used as collateral or to generate yield. Borrowed tokens are excluded, so only assets directly locked in the protocol are counted. This prevents inflating TVL through recursive lending.",
  haven1: {
    ...lending,
  },
};
