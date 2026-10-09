const FACTORY = '0x5934a5C377309453746EE8aa5194F671930c09fa'

const abi = {
  getLaunchedTokens: 'function getLaunchedTokens() view returns (address[])',
  tokenCurves: 'function tokenCurves(address) view returns (address)',
  tokenQuotes: 'function tokenQuotes(address) view returns (address)',
}

async function tvl(api) {
  const tokens = await api.call({ target: FACTORY, abi: abi.getLaunchedTokens })
  const [curves, quotes] = await Promise.all([
    api.multiCall({ target: FACTORY, abi: abi.tokenCurves, calls: tokens }),
    api.multiCall({ target: FACTORY, abi: abi.tokenQuotes, calls: tokens }),
  ])

  return api.sumTokens({ tokensAndOwners: curves.map((curve, i) => [quotes[i], curve]) })
}

module.exports = {
  methodology: 'TVL is the quote currency (ETH or an approved ERC20) held by the bonding curve of every token launched through the Tsunami factory on Ink. A curve that graduates forwards its raise into a Calamari v4 pool, so it stops being counted here.',
  start: '2026-08-31',
  ink: { tvl },
}
