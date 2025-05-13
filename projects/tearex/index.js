
const config = {
  sei: {
    tokenVaults: [
      "0xBd95774b89EE0874df6B1F23884BFdf8C9ec696F",
      "0xa4A956b2515336b754eE20ed58D3b6D67D44807A",
      "0xAc009609BAcEFc9A25897581A9c4a028f79207f1",
      "0x344A61a393C4c61d767C0c2f1fdFb8a09fAAA817"
    ],
    tradingCore: "0x99c2901d2883F8D295A989544f118e31eC21823e"
  }
}

Object.keys(config).forEach(chain => {
  const {tokenVaults, tradingCore,} = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens  = await api.multiCall({  abi: 'address:underlyingAsset', calls: tokenVaults})
      const ownerTokens = tokens.map((token, i) => [[token], tokenVaults[i]])
      ownerTokens.push([tokens, tradingCore])
      return api.sumTokens({ ownerTokens, })
    }
  }
})
