// Credit Coop lending vaults are ERC-7540 vaults that route deposits into two strategies:
// a liquid strategy (idle cash, Morpho vaults) and a credit strategy (facilities drawn by
// borrowers). totalAssets() covers both. Only the liquid side is still held by the protocol,
// so it is tvl; the credit side has left the protocol and is reported as borrowed.
// Vault -> deploy block
const config = {
  ethereum: {
    vaults: {
      '0x6dACaF632017E2DFc929484606B0feb93088B623': 22734650,
      '0x6C99a74a62Aaf2e6Aa3fF08Ce7661D5C86E01DbC': 22641434,
      '0xb21eAFB126cEf15CB99fe2D23989b58e40097919': 24101397,
      '0xC40FBBe06D962570D1eBbe70d4A01A5f14B1C9a2': 25023549,
      '0x507e5DEA003299821961480A8dC42271FebC89AA': 25087816,
    },
  },
  base: {
    vaults: {
      '0x0cf11AC4ea33b6d7274CD7d6e7cEA9f3F65FCf9D': 33603319,
      '0x214699b0ad2e26ffef0247fd0c244bb7fedc85ce': 25055422,
    },
  },
  avax: {
    vaults: {
      '0xc6df254f147dac8e0a891558e8e5d788a8c871be': 74002497,
    },
  },
}

const abi = {
  asset: 'address:asset',
  totalAssets: 'uint256:totalAssets',
  totalLiquidAssets: 'uint256:totalLiquidAssets',
  totalPendingDeposits: 'uint256:totalPendingDeposits',
}

// Vaults not yet deployed at the queried block are skipped, so history can be refilled
async function getVaults(api) {
  const block = await api.getBlock()
  const vaults = Object.entries(config[api.chain].vaults)
    .filter(([, fromBlock]) => block >= fromBlock)
    .map(([vault]) => vault)
  if (!vaults.length) return []
  const tokens = await api.multiCall({ abi: abi.asset, calls: vaults })
  const totalAssets = await api.multiCall({ abi: abi.totalAssets, calls: vaults })
  const liquidAssets = await api.multiCall({ abi: abi.totalLiquidAssets, calls: vaults })
  const pendingDeposits = await api.multiCall({ abi: abi.totalPendingDeposits, calls: vaults })
  return vaults.map((_, i) => ({
    token: tokens[i],
    totalAssets: totalAssets[i],
    liquidAssets: liquidAssets[i],
    pendingDeposits: pendingDeposits[i],
  }))
}

// Cash in the vault and its liquid strategy, plus deposits waiting to be accepted
async function tvl(api) {
  for (const { token, liquidAssets, pendingDeposits } of await getVaults(api)) {
    api.add(token, liquidAssets)
    api.add(token, pendingDeposits)
  }
}

// Credit facilities drawn by borrowers, including accrued interest
async function borrowed(api) {
  for (const { token, totalAssets, liquidAssets } of await getVaults(api)) {
    const credit = BigInt(totalAssets) - BigInt(liquidAssets)
    if (credit > 0n) api.add(token, credit)
  }
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL is the liquid side of each Credit Coop vault: idle cash, deposits held in Morpho vaults through the liquid strategy, and pending deposits. Credit facilities drawn by borrowers are reported separately as borrowed.',
  hallmarks: [
    ['2026-09-10', 'Drawn credit facilities reported as Active Loans, not TVL'],
  ],
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, borrowed }
})
