const { sumTokens2 } = require('../helper/unwrapLPs')

const BONDING_FACTORY = '0x765331F7a008c0609543aCCa6209d91636BceEAC'
const WKAS = '0x17Ec7E1768c813E2a3a9b0f94A35605CA520C242'

async function tvl(api) {
  const curves = await api.call({
    target: BONDING_FACTORY,
    abi: 'function getAllBondingCurves() view returns (address[])',
  })

  const owners = [BONDING_FACTORY, ...curves]
  return sumTokens2({
    api,
    owners,
    tokens: [WKAS],
    fetchCoValentTokens: false,
  })
}

module.exports = {
  methodology: 'TVL is the total KAS locked in LFG bonding curves (tokens in price discovery phase).',
  igra: { tvl },
}
