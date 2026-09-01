const config = {
  polygon_zkevm: '0x14c8FEA10fdc2d1357410f473e2CAa035a872517',
  manta: '0x443Cf165B72e4b4331C0101A10553269972Ed4B8'
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