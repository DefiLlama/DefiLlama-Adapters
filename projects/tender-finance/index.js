const { compoundExports } = require("../helper/compound");

module.exports = {
  methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets.",
  arbitrum: compoundExports(comptroller, 'arbitrum', cEther, '0x82af49447d8a07e3bd95bd0d56f35241523fbab1')
};
