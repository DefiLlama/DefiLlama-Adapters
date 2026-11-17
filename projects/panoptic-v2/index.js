const { tvl } = require('./tvl')

const methodology = 'Counts totalAssets() of Panoptic V2 collateral trackers, idle underlying/native/pool-token balances of registered Panoptic vaults, verified external ERC-4626 allocations held by those vaults, and deployed liquidity owned directly by non-PanopticPool accounts on the V2 SFPMs. Pool-owned SFPM liquidity and vault-held Panoptic collateral receipts are excluded from the additions because collateral trackers already account for them. SFPM inventory uses snapshot liquidity and pool prices, reflecting burns and excluding removed liquidity and accrued fees. External allocation lists are checked against the vault accountant; new allocations require verification before inclusion.'

module.exports = {
  ethereum: { tvl, methodology, start: '2026-06-09' },
  robinhood: { tvl, methodology, start: '2026-09-14' },
}
