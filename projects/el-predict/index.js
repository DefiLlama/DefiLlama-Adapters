// EL Predict (by EL-Casino) — UP / DOWN price rounds on Robinhood Chain.
// ElcasMarketsHub (source verified on Sourcify) gives every stake token its own book, a minimal clone created with
// CREATE2. A book holds, in its stake token: each market's house vault (anyone can LP), players' stakes in open rounds,
// unclaimed winnings, and fee shares accrued for the platform / market creators but not claimed yet (owedTotal).
// ElcasMarketsHub v1, then the V2 hubs: the launchpad's (books its game reserve opens for launched tokens) and the public one
// + the V3 hub (2026-10-28): the launchpad V3 tokens' books, opened by its game reserve
const HUBS = ['0xBd65EE837e57D5060013cbE8bAc8a6d0F8037f45', '0x9DB90Cf484614C3424a49B0cB0b6E5cA7b6a850F', '0xB7eF17054fb9541dd9Bc58E932Af116d11f2fD3f', '0xf31da25f3F4E2f041c63Aa0751ceB69f50fdFd5c', '0x2AC7854F4DBd6e18933dc6c87598532641898Ad1']
const ELCAS = '0xE73f12D9d81ff6b11c1d0261F440c2EA4C400E18' // the protocol's own token: excluded

async function tvl(api) {
  // (a hub not deployed yet at the block reads as empty)
  const lists = await api.multiCall({ abi: 'address[]:allPredictTokens', calls: HUBS, permitFailure: true })
  for (let h = 0; h < HUBS.length; h++) {
    const hub = HUBS[h]
    const tokens = (lists[h] ?? []).filter((t) => t.toLowerCase() !== ELCAS.toLowerCase())
    if (!tokens.length) continue
    const owners = await api.multiCall({ abi: 'function predictBook(address) view returns (address)', target: hub, calls: tokens })
    const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((t, i) => ({ target: t, params: [owners[i]] })) })
    const owed = await api.multiCall({ abi: 'uint256:owedTotal', calls: owners })
    tokens.forEach((token, i) => api.add(token, BigInt(bals[i]) - BigInt(owed[i])))
  }
}

module.exports = {
  methodology: 'Lists every prediction book from the ElcasMarketsHub v1, V2 and V3 hubs (one per hub and stake token) and counts each book\'s balance of its stake token — house vaults, stakes in open rounds and unclaimed winnings — minus the fee shares accrued for the platform and market creators but not yet claimed. Books staked in $ELCAS, the protocol\'s own token, are excluded.',
  start: '2026-10-06',
  robinhood: { tvl },
}
