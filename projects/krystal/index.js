const { tvl: solanaTvl } = require("./solana.js");
const evmTvl = require("./evm.js");

module.exports = {
  solana: {
    tvl: solanaTvl,
  },
  ...evmTvl,
  isHeavyProtocol: true,
  methodology: "TVL: Sum of all positions' value in every vaults",
};
