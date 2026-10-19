// PERPS — permissionless perpetuals on Robinhood Chain (https://perpsfunds.github.io).
// PerpsHub (source verified on Sourcify) gives every margin token its own book, a minimal clone created with CREATE2.
// A book holds, in its margin token: each market's LP vault (the traders' counterparty), the traders' margin, and fee
// shares accrued for the protocol / market creators but not claimed yet (owedTotal — not user money).
const HUB = '0x63ce687590d29fC3aa62a58Df294E0663815C61b'

async function tvl(api) {
  const tokens = await api.call({ abi: 'address[]:allPerpsTokens', target: HUB })
  const books = await api.multiCall({ abi: 'function perpsBook(address) view returns (address)', target: HUB, calls: tokens })
  const [bals, owed] = await Promise.all([
    api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((t, i) => ({ target: t, params: [books[i]] })) }),
    api.multiCall({ abi: 'uint256:owedTotal', calls: books }),
  ])
  tokens.forEach((token, i) => api.add(token, BigInt(bals[i]) - BigInt(owed[i])))
}

module.exports = {
  methodology: 'Lists every perps book from PerpsHub (one per margin token) and counts each book\'s balance of its margin token — LP vaults and traders\' margin — minus the fee shares accrued for the protocol and market creators but not yet claimed.',
  start: '2026-10-08',
  robinhood: { tvl },
}
