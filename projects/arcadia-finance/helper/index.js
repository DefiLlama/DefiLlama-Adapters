const ADDRESSES = require("../../helper/coreAssets.json");
const ARCADIA_ADDRESSES = {
  optimism: {
    factory: "0x00CB53780Ea58503D3059FC02dDd596D0Be926cB",
    wethPool: "0xD417c28aF20884088F600e724441a3baB38b22cc",
    usdcPool: "0x9aa024D3fd962701ED17F76c17CaB22d3dc9D92d"
  },
  ethereum: {
    factory: "0x00CB53780Ea58503D3059FC02dDd596D0Be926cB",
    wethPool: "0xD417c28aF20884088F600e724441a3baB38b22cc",
    usdcPool: "0x9aa024D3fd962701ED17F76c17CaB22d3dc9D92d"
  }
}
const abi = require("./abi.json");


async function addPoolTVL(timestamp, ethBlock, chain, api) {

  const [usdc_trl, weth_trl, usdc_turl, weth_turl] = await Promise.all([
    api.call({ target: ARCADIA_ADDRESSES[chain].usdcPool, abi: abi['totalRealisedLiquidity'], }),
    api.call({ target: ARCADIA_ADDRESSES[chain].wethPool, abi: abi['totalRealisedLiquidity'], }),
    api.call({ target: ARCADIA_ADDRESSES[chain].usdcPool, abi: abi['totalUnrealisedLiquidity'], }),
    api.call({ target: ARCADIA_ADDRESSES[chain].wethPool, abi: abi['totalUnrealisedLiquidity'], }),
  ])

  api.addTokens([
    ADDRESSES[chain].WETH,
    ADDRESSES[chain].WETH,
    ADDRESSES[chain].USDC,
    ADDRESSES[chain].USDC,
  ], [
    weth_trl,
    weth_turl,
    usdc_trl,
    usdc_turl])
}

async function addVaultAssets(timestamp, ethBlock, chain, api) {

  const vaultsLength = await api.call({target: ARCADIA_ADDRESSES[chain].factory, abi: abi['vaultLength']})
  const vaultIds = Array.from(Array(parseInt(vaultsLength)).keys())
  const vaultAddresses = await api.multiCall({target: ARCADIA_ADDRESSES[chain].factory, calls: vaultIds, abi: abi['vaultAddress']})
  const assetsInVaults = await api.multiCall({abi: abi['assetData'], calls: vaultAddresses.map((v) => ({
      target: v,
      params: []
    })),
    ethBlock,
    chain
  })
  for (let i = 0; i < assetsInVaults.length; i++) {
    const assetAddresses_ = assetsInVaults[i][0];
    for (let j = 0; j < assetAddresses_.length; j++) {
      const assetAddress_ = assetAddresses_[j]
      const assetAmount_ = assetsInVaults[i][2][j]
      api.add(assetAddress_, assetAmount_)
    }
  }
}

module.exports = {
  addPoolTVL,
  addVaultAssets,
};