const ADDRESSES = require('../helper/coreAssets.json')
const ZtakeV1Address = "0x9248F1Ee8cBD029F3D22A92EB270333a39846fB2"

async function tvl(api) {
  // Clave aggregator tvl
  const ownerTokens = [[
    [
      '0xd78abd81a3d57712a3af080dc4185b698fe9ac5a',
      '0xd6cd2c0fc55936498726cacc497832052a9b2d1b',
      '0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8',
      '0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46',
      '0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a',
      '0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D',
      '0x697a70779C1A03Ba2BD28b7627a902BFf831b616',
      ADDRESSES.era.ZK,
    ], '0x7f73934F333a25B456Dc9B8b62A19f211c991f1c'
  ]]

  // Clave ztake tvl
  const ZK = await api.call({ abi: 'address:ZK', target: ZtakeV1Address })
  ownerTokens.push([[ZK], ZtakeV1Address])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  doublecounted: true,
  era: {
    tvl,
  }
}
