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

const abi = require("./abi.json");

async function tvl(_, _b, _cb, { api, }) {
  const { chain } = api
  let { factory, pools } = config[chain]
  pools = Object.values(pools)
  const poolAssets = await api.multiCall({ abi: 'address:asset', calls: pools })
  const totalRealisedLiquidity = await api.multiCall({ abi: abi.totalRealisedLiquidity, calls: pools })
  const totalUnrealisedLiquidity = await api.multiCall({ abi: abi.totalUnrealisedLiquidity, calls: pools })
  api.addTokens(poolAssets, totalRealisedLiquidity)
  api.addTokens(poolAssets, totalUnrealisedLiquidity)

  const vaults = await api.fetchList({ lengthAbi: abi.vaultLength, itemAbi: abi.vaultAddress, target: factory, })
  const assetData = await api.multiCall({ abi: abi.assetData, calls: vaults, })

  assetData.forEach((assetsInVaults) => api.addTokens(assetsInVaults[0], assetsInVaults[2]))
}

module.exports = {
  tvl,
};