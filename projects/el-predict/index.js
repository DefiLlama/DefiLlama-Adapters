// EL Predict (by EL-Casino) — UP / DOWN price rounds on Robinhood Chain.
// ElcasMarketsHub (source verified on Sourcify) gives every stake token its own book, a minimal clone created with
// CREATE2. A book holds, in its stake token: each market's house vault (anyone can LP), players' stakes in open rounds,
// unclaimed winnings, and fee shares accrued for the platform / market creators but not claimed yet (owedTotal).
const HUB = '0xBd65EE837e57D5060013cbE8bAc8a6d0F8037f45'
const ELCAS = '0xE73f12D9d81ff6b11c1d0261F440c2EA4C400E18' // the protocol's own token: excluded

async function tvl(api) {
  const tokens = (await api.call({ abi: 'address[]:allPredictTokens', target: HUB })).filter((t) => t.toLowerCase() !== ELCAS.toLowerCase())
  const owners = await api.multiCall({ abi: 'function predictBook(address) view returns (address)', target: HUB, calls: tokens })
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((t, i) => ({ target: t, params: [owners[i]] })) })
  const owed = await api.multiCall({ abi: 'uint256:owedTotal', calls: owners })
  tokens.forEach((token, i) => api.add(token, BigInt(bals[i]) - BigInt(owed[i])))
}

module.exports = {
  methodology: 'Lists every prediction book from ElcasMarketsHub (one per stake token) and counts each book\'s balance of its stake token — house vaults, stakes in open rounds and unclaimed winnings — minus the fee shares accrued for the platform and market creators but not yet claimed. Books staked in $ELCAS, the protocol\'s own token, are excluded.',
  start: '2026-10-06',
  robinhood: { tvl },
}
