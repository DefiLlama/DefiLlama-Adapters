const HYPE_VAULT = '0xd39C426bd1a40b5cdB89B8CEb8464C4f78AbB29d'
const USDC_VAULT = '0xf725Ac947c7B3EF790a3E68e2Ca2Fb48ce4023eD'
const USDC = '0xb88339CB7199b77E23DB6E890353E22632Ba630f'

async function tvl(api) {
  const [hypeAssets, usdcAssets] = await api.multiCall({
    abi: 'uint256:totalAssets',
    calls: [HYPE_VAULT, USDC_VAULT],
  })
  api.addGasToken(hypeAssets)
  api.add(USDC, usdcAssets)
}

module.exports = {
  // V5 activation, HyperEVM block 47181058 (2026-09-29 06:42 UTC).
  start: 1790664120,
  methodology: 'Counts active LP assets reported by totalAssets() in the two Ace.Pro V5 shared liquidity vaults on HyperEVM. Excludes entry escrow, claimable payouts, treasury balances, Bonus prize pools, vault share tokens and legacy vaults. Shared vaults are counted once across all markets. HyperVault strategy products are not included.',
  hyperliquid: { tvl },
}
