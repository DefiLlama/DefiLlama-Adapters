const sdk = require("@defillama/sdk");
const evm = require("./evm");
const solana = require("./solana");

module.exports = {
  doublecounted: true,
  ...evm,
  ...solana,
  tvl: sdk.util.sumChainTvls([
    evm.ethereum.tvl,
    evm.avalanche.tvl,
    evm.aurora.tvl,
    solana.solana.tvl,
  ]),
  methodology: "Sums the totalBalance of all Ribbon Theta Vaults",
};
