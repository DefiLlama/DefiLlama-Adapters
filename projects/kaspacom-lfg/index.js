const { sumTokens2 } = require('../helper/unwrapLPs')

const IGRA_BONDING_FACTORY = '0x765331F7a008c0609543aCCa6209d91636BceEAC'
const KASPLEX_BONDING_FACTORY = '0xb19219AF8a65522f13B51f6401093c8342E27e9D'
const NATIVE_KAS = '0x0000000000000000000000000000000000000000'

async function tvlIgra(api) {
  const curves = await api.call({
    target: IGRA_BONDING_FACTORY,
    abi: 'function getAllBondingCurves() view returns (address[])',
  })

  const owners = [IGRA_BONDING_FACTORY, ...curves]
  return sumTokens2({
    api,
    owners,
    tokens: [NATIVE_KAS],
    fetchCoValentTokens: false,
  })
}

async function tvlKasplex(api) {
  const curves = await api.call({
    target: KASPLEX_BONDING_FACTORY,
    abi: 'function getAllBondingCurves() view returns (address[])',
  })

  const owners = [KASPLEX_BONDING_FACTORY, ...curves]
  return sumTokens2({
    api,
    owners,
    tokens: [NATIVE_KAS],
    fetchCoValentTokens: false,
  })
}

module.exports = {
  methodology: 'TVL is the native KAS locked in KaspaCom LFG bonding curves across supported launchpad networks.',
  igra: { tvl: tvlIgra },
  kasplex: { tvl: tvlKasplex },
}
