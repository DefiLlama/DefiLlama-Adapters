const ADDRESSES = require('../helper/coreAssets.json')

// Immutable basket factories. Every basket published through them is
// enumerable on-chain via allBaskets().
const FACTORIES = [
  '0x6D8C85C8Ac7620aBb3010EE29b20Da1c76093BEf', // BasketFactory (curated, current)
  '0x51dB1A456CA238843A159589Cf28710616b2F988', // BasketFactory (curated, legacy)
  '0x1A3e4B71c58f77a995c1a4C7D76A4296CFDDd489', // BasketFactory2 (agentic)
]

// First-party baskets deployed directly, before the factories went live.
const STANDALONE_BASKETS = [
  '0xe1c1ADAD813736427B334e798fd2EbC7d2C7A9DF', // MAG7
  '0x0CE04932513Fa1768B5b9444c6A21Ae0DdA005C5', // HOOD6
  '0x8fF1d77a09A3292b34457175710Bb0C0A1C22601', // AI6
  '0x42AF29661e5499e526A1e8e0179fc5272c07F4aE', // HOOD6V2
  '0xFF71762cB8bc2a6890eC34Ce3a311d9e410c0Aa7', // VIRTS
]

async function tvl(api) {
  const factoryBaskets = await api.multiCall({ abi: 'address[]:allBaskets', calls: FACTORIES })
  const baskets = [...new Set([...STANDALONE_BASKETS, ...factoryBaskets.flat()].map((a) => a.toLowerCase()))]
  const constituents = await api.multiCall({
    abi: 'function constituents() view returns (address[])',
    calls: baskets,
  })
  // Agentic baskets can hold a USDG buffer between rebalances; it backs the
  // basket NAV, so it counts. Zero on frozen baskets.
  const ownerTokens = baskets.map((basket, i) => [constituents[i].concat(ADDRESSES.robinhood.USDG), basket])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology:
    'TVL is the value of the tokenized stocks and chain-native tokens held as 1:1 backing by every live basket token, plus any USDG rebalance buffer a basket holds. Baskets are enumerated on-chain from the three immutable factories (allBaskets) together with the five first-party baskets deployed before the factories existed; each basket reports its own constituent list on-chain and balances are read from the basket contract itself. User wallets and undistributed dividend pots held by payout distributors are not counted.',
  start: 1783812981, // MAG7 deployment, 2026-07-11
  robinhood: { tvl },
}
