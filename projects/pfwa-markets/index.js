const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

// PFWA Markets: prediction markets on Robinhood Chain (pfwa.fun).
// Every outcome of a market is its own bonding-curve token contract, and that contract holds the ETH paid in for it:
// open positions while the market is live, then the winners' unclaimed payout once it resolves.
// Each factory also holds the markets' bonus pots (its totalBonusPotLocked) in its own ETH balance.
const FACTORIES = [
  '0x2502aB7E69dDb3157683A82E603360Ada9B6E647', // PFWAMarketFactory v1 (legacy)
  '0x7B38e940Cd649bc0C701c42eE1A6ceff75584afa', // PFWAMarketFactory v2 (current)
]

async function tvl(api) {
  const owners = [...FACTORIES]
  for (const factory of FACTORIES) {
    const count = await api.call({ abi: 'uint256:marketCount', target: factory })
    const calls = Array.from({ length: Number(count) }, (_, i) => i)
    const optionTokens = await api.multiCall({ abi: 'function getOptionTokenAddresses(uint256) view returns (address[])', target: factory, calls })
    owners.push(...optionTokens.flat())
  }
  return sumTokens2({ api, owners, tokens: [nullAddress] })
}

module.exports = {
  methodology: 'Lists every market from both PFWAMarketFactory contracts (marketCount, getOptionTokenAddresses) and counts the native ETH held by each outcome token contract (open positions and unclaimed winnings), plus the ETH each factory holds for the markets\' bonus pots. Only ETH is counted; the outcome tokens themselves and the $PFWA token are not.',
  start: '2026-07-29',
  robinhood: { tvl },
}
