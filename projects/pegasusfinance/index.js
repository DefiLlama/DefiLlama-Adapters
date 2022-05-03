const sdk = require("@defillama/sdk");
const { transformOptimismAddress } = require("../helper/portedTokens");

const TREASURY_CONTRACT = "0x680b96DDC962349f59F54FfBDe2696652669ED60";
const LIQUIDITY_POOL_CONTRACT = "0x7398c321449d836cec83582a678ccb8650360a18";
const WETH_OPTIMISM = "0x4200000000000000000000000000000000000006";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const underlyingBalances = await sdk.api.abi.multiCall({
    calls: [
      {
        target: WETH_OPTIMISM,
        params: LIQUIDITY_POOL_CONTRACT,
      },
      {
        target: WETH_OPTIMISM,
        params: TREASURY_CONTRACT,
      },
    ],
    block: chainBlocks.optimism,
    abi: "erc20:balanceOf",
    chain: "optimism",
  });

  const WETH = (await transformOptimismAddress())(WETH_OPTIMISM);
  sdk.util.sumSingleBalance(
    balances,
    WETH,
    underlyingBalances.output[0].output
  );
  sdk.util.sumSingleBalance(
    balances,
    WETH,
    underlyingBalances.output[1].output
  );

  return balances;
}

module.exports = {
  methodology:
    "WETH in left over in treasury + Amount supplied to liquidity pool",
  optimism: {
    tvl,
  },
};
