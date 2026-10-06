// Add a chain by putting its USDW address here. TVL on that chain is USDW totalSupply.
// Supply already includes tokens held by SpotEngine, MarketRegistry, the treasury, and wallets.
const usdW = {
  bsc: '0xe5eBE2AE0a036C955bfF58291826C50F7d670D43',
}

async function tvl(api) {
  const token = usdW[api.chain]
  const supply = await api.call({ target: token, abi: 'erc20:totalSupply' })
  api.add(token, supply)
}

module.exports = {
  start: '2026-10-05',
  methodology: 'TVL is the total supply of USDW on each chain where Wager Predict is deployed.',
}

Object.keys(usdW).forEach(chain => {
  module.exports[chain] = { tvl }
})
