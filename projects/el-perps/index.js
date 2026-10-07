// EL Perps (by EL-Casino) — permissionless perpetuals on Robinhood Chain.
// ElcasMarketsHub (source verified on Sourcify) gives every margin token its own book, a minimal clone created with
// CREATE2. A book holds, in its margin token: each market's LP vault (the traders' counterparty), the traders' margin,
// and fee shares accrued for the platform / market creators but not claimed yet (owedTotal — not user money).
const HUB = '0xBd65EE837e57D5060013cbE8bAc8a6d0F8037f45'
const ELCAS = '0xE73f12D9d81ff6b11c1d0261F440c2EA4C400E18' // the protocol's own token: excluded

async function tvl(api) {
  const tokens = (await api.call({ abi: 'address[]:allPerpsTokens', target: HUB })).filter((t) => t.toLowerCase() !== ELCAS.toLowerCase())
  const owners = await api.multiCall({ abi: 'function perpsBook(address) view returns (address)', target: HUB, calls: tokens })
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((t, i) => ({ target: t, params: [owners[i]] })) })
  const owed = await api.multiCall({ abi: 'uint256:owedTotal', calls: owners })
  tokens.forEach((token, i) => api.add(token, BigInt(bals[i]) - BigInt(owed[i])))
}

module.exports = {
  methodology: 'Lists every perps book from ElcasMarketsHub (one per margin token) and counts each book\'s balance of its margin token — LP vaults and traders\' margin — minus the fee shares accrued for the platform and market creators but not yet claimed. Books margined in $ELCAS, the protocol\'s own token, are excluded.',
  start: '2026-10-06',
  robinhood: { tvl },
}
