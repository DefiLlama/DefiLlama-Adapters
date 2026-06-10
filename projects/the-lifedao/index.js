const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

const VAULT_ADDRESS = "0x6d1bD94Cd572e51Aa018aE6Bf909BA61F8F8d4f9";

async function tvl(api) {
  await sumTokens2({ api, owner: VAULT_ADDRESS, resolveUniV3: true, tokens: [ADDRESSES.arbitrum.USDC] })
}

module.exports = {
  methodology:
    "TVL is calculated by unwrapping the Savings Vault's Uniswap V3 USDC/USDT LP position on Arbitrum into its underlying token balances.",
  arbitrum: {
    tvl,
  },
};
