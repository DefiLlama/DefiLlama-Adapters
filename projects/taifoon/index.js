const { sumTokens } = require('../helper/chain/icp')

// ICP custody canister of the tICP bridge: ICP deposited here is proven on chain (EVM light client of the
// Internet Computer) and releases tICP 1:1 on Base, Arc and Robinhood Chain; returning tICP releases the ICP.
const CUSTODY_CANISTER = 'dkafq-4aaaa-aaaaj-a6ysq-cai'

async function tvl() {
  return sumTokens({ owners: [CUSTODY_CANISTER] })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the ICP held on the ICP ledger by the bridge custody canister (dkafq-4aaaa-aaaaj-a6ysq-cai, default account). That ICP backs tICP (0x60CaC3229c022dcc059e1F4352695127Dc96bC0d) released 1:1 on Base, Arc and Robinhood Chain.',
  icp: { tvl },
}
