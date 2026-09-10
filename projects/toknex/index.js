const vaults = [
  '0x44f5D969769335B895fEd06fa6408aB56a891213',
  '0xBa78aaB35f820c29627420D8413b106dd798Cb09',
]

const vaultStatsAbi = 'function vaultStats() view returns ((uint256 totalShares, uint256 activeAUM, uint256 pendingLiabilities, uint256 vaultBalance, uint256 pricePerShare, uint256 pendingCount, bool isPaused, address fundsManager, address asset) stats)'

async function tvl(api) {
  const stats = await api.multiCall({ abi: vaultStatsAbi, calls: vaults })
  stats.forEach(({ asset, activeAUM, pendingLiabilities }) => api.add(asset, (BigInt(activeAUM) + BigInt(pendingLiabilities)).toString()))
}

module.exports = {
  methodology: 'Counts active AUM plus outstanding pending redemption liabilities until settlement, in the underlying asset units. Active AUM includes authorized operator revaluations; underlying strategy backing is not independently verified by the adapter.',
  ethereum: { tvl },
  bsc: { tvl },
}
