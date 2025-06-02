const { sumTokens2 } = require('../../helper/unwrapLPs')
const abi = require("./abi.json")

const config = {
  optimism: {
    factory: "0x00CB53780Ea58503D3059FC02dDd596D0Be926cB",
    pools: {
      wethPool: "0xD417c28aF20884088F600e724441a3baB38b22cc",
      usdcPool: "0x9aa024D3fd962701ED17F76c17CaB22d3dc9D92d"
    }
  },
  ethereum: {
    factory: "0x00CB53780Ea58503D3059FC02dDd596D0Be926cB",
    pools: {
      wethPool: "0xD417c28aF20884088F600e724441a3baB38b22cc",
      usdcPool: "0x9aa024D3fd962701ED17F76c17CaB22d3dc9D92d",
    }
  }
}


async function tvl(api) {
  const { chain } = api
  let { factory, pools } = config[chain]
  pools = Object.values(pools)
  const poolAssets = await api.multiCall({ abi: 'address:asset', calls: pools })

  const vaults = await api.fetchList({ lengthAbi: abi.vaultLength, itemAbi: abi.vaultAddress, target: factory, })
  const assetData = await api.multiCall({ abi: abi.assetData, calls: vaults, })

  assetData.forEach((assetsInVaults) => api.addTokens(assetsInVaults[0], assetsInVaults[2]))

  return sumTokens2({ api, tokensAndOwners2: [poolAssets, pools, ]})
}

module.exports = {
  tvl,
};