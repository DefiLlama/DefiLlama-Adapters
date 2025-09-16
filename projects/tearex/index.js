
const config = {
  sei: {
    tokenVaults: [
      "0xBd95774b89EE0874df6B1F23884BFdf8C9ec696F",
      "0xa4A956b2515336b754eE20ed58D3b6D67D44807A",
      "0xAc009609BAcEFc9A25897581A9c4a028f79207f1",
      "0x344A61a393C4c61d767C0c2f1fdFb8a09fAAA817",
      "0x332a22650f1cA3F6239eFA4d41c673Ca3A8E5a0f",
      "0x8a3FA2B3BA32B29d8Ec1f301c8Ce3B06Be71baFa",
      "0x24cbB32AD057849Aa055FCF6B5dF7238318889e4",
      "0xE4445293C5A4a159738a0efBD062242f3C726275",
      "0xea82a5508A016239B523dE82c58278b749Bd557c"
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
