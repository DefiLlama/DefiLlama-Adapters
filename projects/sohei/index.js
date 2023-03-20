const { compoundExports } = require("../helper/compound");

module.exports = {
  methodology:
    "Same as compound, we just get all the collateral (not borrowed money) on the lending markets.",
  arbitrum: compoundExports(
    "0x9F750CF10034f3d7a18221aEc0BdDab7fC6F32bA",
    "arbitrum"
  ),
};
