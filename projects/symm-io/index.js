const config = {
  arbitrum: "0x8F06459f184553e5d04F07F868720BDaCAB39395",
  mantle: "0x2Ecc7da3Cc98d341F987C85c3D9FC198570838B5",
  bsc: "0x9A9F48888600FC9c05f11E03Eab575EBB2Fc2c8f",
  base: ["0x91Cf2D8Ed503EC52768999aA6D8DBeA6e52dbe43", '0xC6a7cc26fd84aE573b705423b7d1831139793025'],
  berachain: "0x3d17f073cCb9c3764F105550B0BCF9550477D266",
  mode: "0x3d17f073cCb9c3764F105550B0BCF9550477D266",
  iotaevm: "0xc258535aaF6ad3cEd5D2E03e2B66C35262488309",
  sonic: "0x803de354cbd853D9aE3BC58131A5D538DE7a72E3",
  coti: "0x2Ecc7da3Cc98d341F987C85c3D9FC198570838B5",
}

Object.keys(config).forEach(chain => {
  let vault = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (!Array.isArray(vault)) vault = [vault]
      const collateral = await api.multiCall({ abi: 'address:getCollateral', calls: vault })
      return api.sumTokens({ tokensAndOwners2: [collateral, vault] })
    }
  }
})