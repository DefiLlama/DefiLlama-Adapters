const config = {
  linea: '0xb514Ee8a1e00B102cE2312048abcbc3E57bfED94',
  polygon: '0xAb36984e4952e5a9d08536C4dE5190ed37725017'
}

Object.keys(config).forEach(chain => {
  const target = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens= await api.call({  abi: 'address[]:getAssetList', target})
      return api.sumTokens({ owner: target, tokens })
    }
  }
})