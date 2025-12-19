const config = {
  sei: [
    // alpha USDC.n
    "0xBd95774b89EE0874df6B1F23884BFdf8C9ec696F",
    "0xa4A956b2515336b754eE20ed58D3b6D67D44807A",
    "0xAc009609BAcEFc9A25897581A9c4a028f79207f1",
    "0x344A61a393C4c61d767C0c2f1fdFb8a09fAAA817",
    // degen USDC
    "0x332a22650f1cA3F6239eFA4d41c673Ca3A8E5a0f",
    "0x8a3FA2B3BA32B29d8Ec1f301c8Ce3B06Be71baFa",
    "0x24cbB32AD057849Aa055FCF6B5dF7238318889e4",
    "0xE4445293C5A4a159738a0efBD062242f3C726275",
    "0xea82a5508A016239B523dE82c58278b749Bd557c",
    // bluechip USDC
    "0x09148a9516293669AE636e96d51F7489c40237ED",
    "0x1111Be4D3A0c8b435372F63e027F8cda66127432",
    "0x6b118384c18806768BDBd9EA5d572e0D7CC73a78",
    "0x41ADbD162EC11A217889CE81b1689AD4a04E8AB8",
  ]
}

Object.keys(config).forEach(chain => {
  const tokenVaults = config[chain]

  module.exports[chain] = {
    tvl: async (api) => {
      const tokens  = await api.multiCall({ abi: 'function underlyingAsset() view returns (address)', calls: tokenVaults })
      const supply = await api.multiCall ({ abi: 'function totalSupply() view returns (uint256)', calls: tokenVaults })
      const rate = await api.multiCall ({ abi: 'function getConversionRates() view returns (uint256, uint256)', calls: tokenVaults })
      const balances = supply.map((s, i) => {
        const r = rate[i][0];
        return BigInt(s) * BigInt(r) / (10n ** 36n)
      });
      api.addTokens(tokens, balances)
    }
  }
})
