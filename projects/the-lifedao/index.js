const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");
const sdk = require("@defillama/sdk");

const VAULT_ADDRESS = "0x6d1bD94Cd572e51Aa018aE6Bf909BA61F8F8d4f9";
const CHAIN = "arbitrum";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await getChainTransform(CHAIN);

  // Fetch LP token balance held by the Savings Vault
  const lpTokenCall = await sdk.api.abi.call({
    target: VAULT_ADDRESS,
    abi: "erc20:balanceOf",
    params: [VAULT_ADDRESS],
    chain: CHAIN,
    block: chainBlocks[CHAIN],
  });

  // Unwrap the Uniswap V3 LP position into underlying USDC + USDT amounts
  await unwrapUniswapLPs(
    balances,
    [{ token: VAULT_ADDRESS, balance: lpTokenCall.output }],
    chainBlocks[CHAIN],
    CHAIN,
    transform
  );

  return balances;
}

module.exports = {
  methodology:
    "TVL is calculated by unwrapping the Savings Vault's Uniswap V3 USDC/USDT LP position on Arbitrum into its underlying token balances.",
  arbitrum: {
    tvl,
  },
};
