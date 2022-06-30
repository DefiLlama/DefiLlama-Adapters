const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { transformOptimismAddress } = require("../helper/portedTokens");

// Ethereum
const ETH_BULL_VAULT = "0xad48a8261b0690c71b70115035eb14afd9a43242";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

// Optimism
const BASIS_TRADING_VAULT = "0xD576bE0d3CC1c0184d1ea3F1778A4A9Dec523859";
const OPT_USDC = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";

async function ethTvl(block) {
  return {
    [WETH]: (
      await sdk.api.abi.call({
        target: ETH_BULL_VAULT,
        block,
        abi: abi.totalAsset,
        chain: "ethereum",
      })
    ).output,
  };
}

async function optTvl(block) {
  const transform = await transformOptimismAddress();
  return {
    [transform(OPT_USDC)]: (
      await sdk.api.abi.call({
        target: BASIS_TRADING_VAULT,
        block,
        abi: abi.totalAssets,
        chain: "optimism",
      })
    ).output,
  };
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  optimism: {
    tvl: optTvl,
  },
};
