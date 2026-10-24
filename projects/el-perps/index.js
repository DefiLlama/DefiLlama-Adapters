// EL Perps (by EL-Casino) — permissionless perpetuals on Robinhood Chain.
// ElcasMarketsHub (source verified on Sourcify) gives every margin token its own book, a minimal clone created with
// CREATE2. A book holds, in its margin token: each market's LP vault (the traders' counterparty), the traders' margin,
// and fee shares accrued for the platform / market creators but not claimed yet (owedTotal — not user money).
// ElcasMarketsHub v1, then the V2 hubs: the launchpad's (books its game reserve opens for launched tokens) and the public one
const HUBS = ['0xBd65EE837e57D5060013cbE8bAc8a6d0F8037f45', '0x9DB90Cf484614C3424a49B0cB0b6E5cA7b6a850F', '0xB7eF17054fb9541dd9Bc58E932Af116d11f2fD3f']
const ELCAS = '0xE73f12D9d81ff6b11c1d0261F440c2EA4C400E18' // the protocol's own token: excluded

async function tvl(api) {
  // (a hub not deployed yet at the block reads as empty)
  const lists = await api.multiCall({ abi: 'address[]:allPerpsTokens', calls: HUBS, permitFailure: true })
  for (let h = 0; h < HUBS.length; h++) {
    const hub = HUBS[h]
    const tokens = (lists[h] ?? []).filter((t) => t.toLowerCase() !== ELCAS.toLowerCase())
    if (!tokens.length) continue
    const owners = await api.multiCall({ abi: 'function perpsBook(address) view returns (address)', target: hub, calls: tokens })
    const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((t, i) => ({ target: t, params: [owners[i]] })) })
    const owed = await api.multiCall({ abi: 'uint256:owedTotal', calls: owners })
    tokens.forEach((token, i) => api.add(token, BigInt(bals[i]) - BigInt(owed[i])))
  }
}

module.exports = {
  methodology: 'Lists every perps book from the ElcasMarketsHub v1 and V2 hubs (one per hub and margin token) and counts each book\'s balance of its margin token — LP vaults and traders\' margin — minus the fee shares accrued for the platform and market creators but not yet claimed. Books margined in $ELCAS, the protocol\'s own token, are excluded.',
  start: '2026-10-06',
  robinhood: { tvl },
}
