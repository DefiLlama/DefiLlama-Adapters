const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  // RFX v1 market addresses
  const owners = [
    "0xe273272dD4016626C2C640Cf85c9cdBB8786286B",
    "0x394ffe92ae4f9a3B3Ba81A6Fd16de423891358C9",
    "0x567779Fd248a6f5596748510200C00655b3a0e01",
    "0x62170Af269E9Acd09a89279C0485e89aA42857A3",
    "0x29c8973cfc64780B9d7fb532A014b3F66DBfD9d1",
    "0x822eeCbF89f2431d50Bb540980Cb98F01a5A4eea",
    "0x3bA5B5bd204D2a3DC42eD520626744acaCbBa215",
    "0x79302b73acF3ec1c18433ef6E04F814C1Cdc408F",
    "0x9D4d54c8661a17604A46B849DED78Cf20127fB92",
    "0x8EFA54951bF70D9775DFe8F9364df83aD1e1a8cF",
    "0x2B7402FfecBC34eBB2a5E87A8F22677Ba0a3b2F5",
    "0x7D00EBe4a0aA10eB99dC661e5A305fb3cdB79E8c"
  ]
  const tokens = [
    ADDRESSES.era.WETH,
    ADDRESSES.era.USDC,
    "0xB21f16d1EA2E8D96CcFafA397cEf855Bf368AA83",
    ADDRESSES.era.ZK,
    "0x703b52F2b28fEbcB60E1372858AF5b18849FE867",
    "0x0469d9d1dE0ee58fA1153ef00836B9BbCb84c0B6"
  ]
  return sumTokens2({ api, owners, tokens })
}

module.exports = {
  era: {
    tvl,
  },
};