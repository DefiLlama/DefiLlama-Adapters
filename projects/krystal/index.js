const { tvl: solanaTvl } = require("./solana.js");
const evmTvl = require("./evm.js");

module.exports = {
  solana: {
    tvl: solanaTvl,
  },
  ...evmTvl,
  isHeavyProtocol: true,
  methodology: "Sum of all positions' value and tokens in every vaults",
};
