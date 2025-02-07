const { tvl: solanaTvl } = require("./solana.js");

module.exports = {
  solana: {
    tvl: solanaTvl,
  },
  methodology: "TVL: Sum of all positions' value in every vaults",
};
