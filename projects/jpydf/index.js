const vaults = [
  '0x6042755ecca71a1be9c7091441ca5beaa6b520e4', // wstETH
  '0x087ebaf3f1b094b2046912a5e5f0bad78df3eaa7', // USDC
]

async function tvl(api) {
  for (const vault of vaults) {
    const underlying = await api.call({ target: vault, abi: 'address:underlying' })
    const buffer = await api.call({ target: vault, abi: 'uint256:bufferBalance' })
    api.add(underlying, buffer)
    const strategies = await api.fetchList({ target: vault, lengthAbi: 'getStrategiesCount', itemAbi: 'strategies' })
    const assets = await api.multiCall({ abi: 'uint256:estimatedTotalUnderlying', calls: strategies })
    assets.forEach(amount => api.add(underlying, amount))
  }
}

module.exports = {
  doublecounted: true, // wstETH is also counted by Lido; allocated USDC overlaps Aave V3 / Morpho.
  methodology: 'Underlying assets in the production CollateralVault buffers, excluding protected backstop reserves, plus the underlying value of each registered Strategy position, including accrued yield. Counts deposits whether or not used in a Trove, and assets pending withdrawal until paid out. JPYdf, dToken balances, debt, external LP positions and Treasury balances are not added. Assets deployed to Lido, Aave V3 and Morpho overlap those protocols.',
  start: '2026-09-30',
  ethereum: { tvl },
}
