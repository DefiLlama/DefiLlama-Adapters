const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')
const MATRIX_API = "https://api-v2.matrix.farm/statistics/latest";

const chains = ['bsc', "fantom", "arbitrum", "optimism", "dogechain", 'base']

module.exports = {
  doublecounted: true,
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "The TVL is calculated using a google cloud function that runs every minute, it checks the value of all the LPs staked in our vaults and returns the total",
}

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})

async function tvl(api) {
  let { tvl: { vaults } } = await getConfig('matri-farm', MATRIX_API)
  vaults = vaults.filter(vault => vault.chain === api.chain).map(i => i.address)
  let wants = await api.multiCall({ abi: 'address:want', calls: vaults, permitFailure: true })
  const wantVaults = vaults.filter((vault, i) => wants[i])
  wants = wants.filter(want => want)
  const wantBals = await api.multiCall({ calls: wantVaults, abi: 'uint256:balance' })
  api.addTokens(wants, wantBals)
  return sumTokens2({ api, resolveLP: true })
}