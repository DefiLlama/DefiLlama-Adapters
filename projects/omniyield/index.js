const { getConfig } = require("../helper/cache")
const { sumERC4626Vaults } = require("../helper/erc4626")

const ENDPOINT = "https://api.omniyield.finance/pools";

async function tvl(api) {
  const pools = await getConfig("omniyield/arbitrum", ENDPOINT);
  const vaults = (pools[api.chainId] ?? []).map(i => i.address)
  return sumERC4626Vaults({ api, calls: vaults, tokenAbi: 'token', balanceAbi: 'totalValue' })
}

module.exports = {
  methodology:
    "TVL is calculated by summing the total value of assets locked in all pools.",
  arbitrum: { tvl },
};