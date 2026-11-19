const BigNumber = require('bignumber.js')

const IGRA_BONDING_FACTORY = '0x765331F7a008c0609543aCCa6209d91636BceEAC'
const KASPLEX_BONDING_FACTORY = '0xb19219AF8a65522f13B51f6401093c8342E27e9D'

async function sumNativeKAS(api, factory) {
  const curves = await api.call({
    target: factory,
    abi: 'function getAllBondingCurves() view returns (address[])',
  })

  const owners = [factory, ...curves]
  const nativeBalances = await Promise.all(owners.map(owner => api.provider.getBalance(owner)))

  return nativeBalances.reduce(
    (acc, balance) => acc.plus(balance.toString()),
    new BigNumber(0)
  )
}

async function tvlIgra(api) {
  const nativeKASWei = await sumNativeKAS(api, IGRA_BONDING_FACTORY)
  api.addCGToken('kaspa', nativeKASWei.div(1e18).toNumber())
}

async function tvlKasplex(api) {
  const nativeKASWei = await sumNativeKAS(api, KASPLEX_BONDING_FACTORY)
  api.addCGToken('kaspa', nativeKASWei.div(1e18).toNumber())
}

module.exports = {
  methodology: 'TVL is the native KAS currently held in KaspaCom LFG bonding curve contracts across supported launchpad networks. Graduated curves may retain historical reserve data, but TVL counts only live native KAS balances still locked in the contracts.',
  igra: { tvl: tvlIgra },
  kasplex: { tvl: tvlKasplex },
}
