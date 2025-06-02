const sdk = require('@defillama/sdk')
const ADDRESSES = require('./helper/coreAssets.json')
const { getUniTVL } = require('./helper/unknownTokens')
const { staking } = require('./helper/staking')

const V2_FACTORY_ADDRESS = '0x68A384D826D3678f78BB9FB1533c7E9577dACc0E'
const xSTELLA_ADDRESS = '0x06A3b410b681c82417A906993aCeFb91bAB6A080'

const dexTVL = getUniTVL({
  factory: V2_FACTORY_ADDRESS,
  useDefaultCoreAssets: true,
})

async function stablePoolTVL(api) {
  const pools = [
    // Legacy
    '0x422b5b7a15fb12c518aa29f9def640b4773427f8', // SFL - 4pool V1 (nomad)
    '0xb86271571c90ad4e0c9776228437340b42623402', // SFL - eth 2pool V1 (nomad)
    '0x7FbE3126C03444D43fC403626ec81E3e809E6b46', // SFL - MAI - 4pool V1 (nomad)

    // Retired
    '0xB1BC9f56103175193519Ae1540A0A4572b1566F6', // SFL - 4pool V1 (wormhole)
    '0x715D7721Fa7e8616aE9D274704aF77857779f6F0', // SFL - athUSDC - 4pool V1 (wormhole)
    '0xF0A2ae65342f143fc09c83E5f19b706aBB37414D', // SFL - MAI - 4pool V1 (wormhole)

    // Active
    '0x5c3dc0ab1bd70c5cdc8d0865e023164d4d3fd8ec', // SFL - 3pool V1 (wormhole)
    '0x95953409374e1ed252c6D100E7466E346E3dC5b9', // SFL - 2pool V1 (wormhole)
    '0x63Ba230fb281A44CB778Ea67a8caE538459c1d0b', // SFL - MAI - 3pool V1 (wormhole)
  ]

  let lpTokens = await api.multiCall({ abi: abi.getLpToken, calls: pools, })
  const tokens = await api.multiCall({ abi: abi.getTokens, calls: pools, })
  const ownerTokens = pools.map((v, i) => [tokens[i], v])

  return api.sumTokens({ ownerTokens, blacklistedTokens: lpTokens, })
}

module.exports = {
  misrepresentedTokens: true,
  moonbeam: {
    tvl: sdk.util.sumChainTvls([dexTVL, stablePoolTVL]),
    staking: staking(xSTELLA_ADDRESS, ADDRESSES.moonbeam.STELLA)
  }
}

const abi = {
  getTokens: "address[]:getTokens",
  getLpToken: "address:getLpToken",
}
