const { getUniTVL } = require("../helper/unknownTokens");
const sdk = require("@defillama/sdk");
const uniswap = require("../helper/abis/uniswap");

const dexTVL = getUniTVL({
  useDefaultCoreAssets: true,
  factory: "0x224302153096E3ba16c4423d9Ba102D365a94B2B",
  abis: {
    allPairsLength: uniswap.allPairsLength,
    allPairs: uniswap.allPairs,
    token0: uniswap.token0,
    token1: uniswap.token1,
    getReserves: uniswap.getReserves,
  },
  exports,
});

module.exports = {
  methodology:
    "TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://dgswap.io/info as the source.",
  klaytn: {
    tvl: sdk.util.sumChainTvls([dexTVL]),
  },
  misrepresentedTokens: true,
};
