const { sumERC4626Vaults } = require('../helper/erc4626')

const FACTORY = '0x9c3663FA9ab976E67B42939486EC4966Cb41a0BB'

const TEST_VAULTS = new Set([
  '0x1193bcbfafeb2f25c516817c46bd3143936d1d5c', // pTEST
  '0x4595a18b47c6fb46f3a157e2918f5c34cdca35eb', // pTESTR
])

async function tvl(api) {
  const allVaults = await api.fetchList({
    target: FACTORY,
    lengthAbi: 'uint256:pTokenCount',
    itemAbi: 'function pTokenAt(uint256) view returns (address)',
  })

  const vaults = allVaults.filter(
    (vault) => !TEST_VAULTS.has(vault.toLowerCase())
  )

  return sumERC4626Vaults({
    api,
    calls: vaults,
    isOG4626: true,
  })
}

module.exports = {
  doublecounted: true,
  methodology:
    'TVL is the net asset value of all production Arcus pToken managed perpetual accounts registered by the pToken factory, read on-chain from totalAssets() on each ERC-4626 vault and denominated in USDG. Test vaults are excluded. It is marked doublecounted because pToken collateral is transferred to the Arcus Perps bridge and is already included in Arcus Perps TVL.',
  start: '2026-08-07',
  robinhood: { tvl },
}
