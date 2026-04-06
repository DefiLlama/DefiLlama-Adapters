const { sumTokens2 } = require('../helper/unwrapLPs')

const BONDING_FACTORY = '0x765331F7a008c0609543aCCa6209d91636BceEAC'

async function tvl(api) {
  const curves = await api.call({
    target: BONDING_FACTORY,
    abi: 'function getAllBondingCurves() view returns (address[])',
  })

  const owners = [BONDING_FACTORY, ...curves]
  return sumTokens2({
    api,
    owners,
    fetchCoValentTokens: false,
  })
}

module.exports = {
  methodology: 'TVL is the total KAS locked in LFG bonding curves (tokens in price discovery phase).',
  igra: { tvl },
}
