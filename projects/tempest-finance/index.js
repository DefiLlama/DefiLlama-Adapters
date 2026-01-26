const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require("../helper/unwrapLPs");
const chains = {
    ethereum: 1,
    optimism: 10,
    bsc: 56,
    manta: 169,
    canto: 7700,
    base: 8453,
    arbitrum: 42161,
    scroll: 534352,
    swellchain: 1923,
}

async function tvl(api) {
  const response = await getConfig(`tempest-fi/${api.chain}`, `https://protocol-service-api.tempestfinance.xyz/api/v1/vaults?chainId=${chains[api.chain]}`)
  const vaults = response.data.vaults;

  const tokens = vaults.map(vault => vault.mainAsset);
  const balances = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults.map(vault => vault.address) });

  api.addTokens(tokens, balances)
  return sumTokens2({ api })
}

Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    tvl
  }
})
