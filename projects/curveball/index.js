const LAUNCHPAD = '0xCD07f89C29E1FAE77EC1a342b5D47D9008E9a72d'
const WETH = '0x4200000000000000000000000000000000000006'

async function tvl(api) {
  // The launchpad keeps this aggregate in sync with buys, sells, and graduations.
  // It excludes virtual reserves, fees, and WETH donated to the contract.
  const realQuote = await api.call({ target: LAUNCHPAD, abi: 'uint256:totalRealQuote' })
  api.add(WETH, realQuote)
}

module.exports = {
  start: 26659759,
  methodology: 'Counts WETH held by the Curveball launchpad and owed to traders on active bonding curves, using its on-chain totalRealQuote. Excludes virtual reserves, unsold tokens, fees, treasury balances, and liquidity after graduation into Icarus pools.',
  rise: { tvl },
}
