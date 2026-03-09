function getTvlOfSupplyAssets(config){
  const exportsObject = {}
  Object.keys(config).forEach(chain => {
    const tokens = config[chain]
    exportsObject[chain] = {
      tvl: async (api) => {
        const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: tokens })
        api.add(tokens, supplies)
      }
    }
  })
  return exportsObject
}

module.exports = {
  getTvlOfSupplyAssets
}