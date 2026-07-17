// Normally a nested vault is detectable because the parent's strategy address
// is the child vault address. These entries cover the exceptional flow where an
// intermediary strategy converts the parent's asset and deposits into a child
// at a different address:
//
//   parent vault -> intermediary strategy -> child Yearn vault
//
// Only add an entry when the conversion is known to be 1:1. DAI/USDS is fixed
// by Sky's converter; the DAI/USDC strategy only deploys through the LitePSM
// while its entry and exit fees are 0. Leveraged lender/borrower strategies do
// not belong here: their child deposit is funded by debt and must be measured
// against the borrow liability instead of the parent's Yearn debt.
const crossAssetNestedVaults = [
  {
    chainId: 1,
    parent: '0x028ec7330ff87667b6dfb0d94b954c820195336c', // DAI-1
    strategy: '0xaedf7d5f3112552e110e5f9d08c9997adce0b78d', // DAI -> USDS
    child: '0x182863131f9a4630ff9e27830d945b1413e347e8', // USDS-1
    parentDecimals: 18,
    childDecimals: 18,
  },
  {
    chainId: 1,
    parent: '0x028ec7330ff87667b6dfb0d94b954c820195336c', // DAI-1
    strategy: '0xff03dce6d95aa7a30b75efbafd11384221b9f9b5', // DAI -> USDC
    child: '0xbe53a109b494e5c9f97b9cd39fe969be68bf6204', // USDC-1
    parentDecimals: 18,
    childDecimals: 6,
  },
]

function scaleTokenAmount(amount, fromDecimals, toDecimals) {
  const value = BigInt(amount)
  if (fromDecimals === toDecimals) return value

  // currentDebt is stored in parent-asset units. Normalize it to the child
  // asset's units before subtracting it from child.totalAssets(). Integer
  // division intentionally rounds down so the adapter never over-deducts.
  const decimalDifference = BigInt(Math.abs(fromDecimals - toDecimals))
  const scale = 10n ** decimalDifference
  return fromDecimals > toDecimals ? value / scale : value * scale
}

function buildIncomingDebtByVault(vaults) {
  // The vault index supports the common case where a strategy is itself a
  // tokenized Yearn vault. Such a vault appears both in parent.debts and in the
  // top-level Kong vault list.
  const vaultByAddress = new Map(vaults.map(vault => [vault.address.toLowerCase(), vault]))
  const incomingDebtByVault = new Map()

  // Include the parent in this key so reusing the same strategy contract from
  // another vault cannot accidentally activate a cross-asset deduction.
  const crossAssetEdgeByDebt = new Map(
    crossAssetNestedVaults.map(edge => [
      `${edge.chainId}:${edge.parent}:${edge.strategy}`,
      edge,
    ]),
  )

  for (const parent of vaults) {
    const parentAsset = parent.asset?.address?.toLowerCase()
    if (!parentAsset) continue

    for (const debt of parent.debts ?? []) {
      const strategy = debt.strategy?.toLowerCase()
      const crossAssetEdge = crossAssetEdgeByDebt.get(
        `${parent.chainId}:${parent.address.toLowerCase()}:${strategy}`,
      )

      // Auto-detected edges use the strategy as the child. Registered edges
      // replace it with the explicitly verified destination vault.
      const child = vaultByAddress.get(crossAssetEdge?.child ?? strategy)
      const childAsset = child?.asset?.address?.toLowerCase()
      const isSameAssetEdge = childAsset === parentAsset
      const isRegisteredCrossAssetEdge = crossAssetEdge?.child === child?.address.toLowerCase()
      if (!child || child.chainId !== parent.chainId || (!isSameAssetEdge && !isRegisteredCrossAssetEdge)) continue

      const currentDebt = crossAssetEdge
        ? scaleTokenAmount(
          debt.currentDebt ?? 0,
          crossAssetEdge.parentDecimals,
          crossAssetEdge.childDecimals,
        )
        : BigInt(debt.currentDebt ?? 0)
      if (currentDebt <= 0n) continue

      // Multiple parents may allocate to the same child, so aggregate all
      // incoming debt before adjusting the child's balance.
      const childAddress = child.address.toLowerCase()
      incomingDebtByVault.set(
        childAddress,
        (incomingDebtByVault.get(childAddress) ?? 0n) + currentDebt,
      )
    }
  }

  return incomingDebtByVault
}

function subtractIncomingDebt(totalAssets, incomingDebt = 0n) {
  const assets = BigInt(totalAssets)

  // Snapshot timing can make reported debt briefly exceed totalAssets. A
  // zero floor avoids emitting a negative token balance in that situation.
  return assets > incomingDebt ? assets - incomingDebt : 0n
}

module.exports = { buildIncomingDebtByVault, scaleTokenAmount, subtractIncomingDebt }
