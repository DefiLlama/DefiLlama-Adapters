const { sumTokens2 } = require("../helper/unwrapLPs")

const config = {
  ethereum: { poolsAndAssets: [
    { pool: '0x6818809eefce719e480a7526d76bd3e561526b46', assets: ['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE']}
  ]},
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl
  }
})

async function tvl(api) {
  const { poolsAndAssets } = config[api.chain]
  const tokens = []
  const calls = []
  poolsAndAssets.forEach(({ pool, assets }) => {
    assets.forEach(asset => {
      tokens.push(asset)
      calls.push({ target: pool, params: asset })
    })
  })
  const poolConfig = await api.multiCall({  abi: "function assetConfig(address _asset) view returns (address pool, uint256 minimumDepositAmount, uint256 vettingFeeBPS, uint256 maxRelayFeeBPS)", calls: calls })
  const owners = poolConfig.map(i => i.pool)
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners], })
  
}