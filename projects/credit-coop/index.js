// Credit Coop lending vaults are ERC-7540 vaults that route deposits into two strategies:
// a liquid strategy (idle cash, Morpho vaults) and a credit strategy (facilities drawn by
// borrowers). totalAssets() covers both. Only the liquid side is still held by the protocol,
// so it is tvl; the credit side has left the protocol and is reported as borrowed.
const config = {
  ethereum: {
    vaults: [
      '0x6dACaF632017E2DFc929484606B0feb93088B623',
      '0x6C99a74a62Aaf2e6Aa3fF08Ce7661D5C86E01DbC',
      '0xb21eAFB126cEf15CB99fe2D23989b58e40097919',
      '0xC40FBBe06D962570D1eBbe70d4A01A5f14B1C9a2',
      '0x507e5DEA003299821961480A8dC42271FebC89AA',
    ],
  },
  base: {
    vaults: [
      '0x0cf11AC4ea33b6d7274CD7d6e7cEA9f3F65FCf9D',
      '0x214699b0ad2e26ffef0247fd0c244bb7fedc85ce',
    ],
  },
  avax: {
    vaults: [
      '0xc6df254f147dac8e0a891558e8e5d788a8c871be',
    ],
  },
}

const abi = {
  asset: 'address:asset',
  totalAssets: 'uint256:totalAssets',
  totalLiquidAssets: 'uint256:totalLiquidAssets',
  totalPendingDeposits: 'uint256:totalPendingDeposits',
}

// The vaults were deployed between 2025-06 and 2026-05. At a block before a vault existed its
// calls revert; permitFailure lets the other vaults on the chain still be counted, so the
// adapter runs at any block since listing instead of failing before the newest deployment.
// A vault that does not exist yet contributes nothing.
async function getVaults(api) {
  const { vaults } = config[api.chain]
  const [tokens, totalAssets, liquidAssets, pendingDeposits] = await Promise.all([
    abi.asset,
    abi.totalAssets,
    abi.totalLiquidAssets,
    abi.totalPendingDeposits,
  ].map(abi => api.multiCall({ abi, calls: vaults, permitFailure: true })))
  return vaults
    .map((_, i) => ({
      token: tokens[i],
      totalAssets: totalAssets[i],
      liquidAssets: liquidAssets[i],
      pendingDeposits: pendingDeposits[i],
    }))
    .filter(v => v.token && v.totalAssets !== null && v.liquidAssets !== null)
}

// Cash in the vault and its liquid strategy, plus deposits waiting to be accepted
async function tvl(api) {
  for (const { token, liquidAssets, pendingDeposits } of await getVaults(api)) {
    api.add(token, liquidAssets)
    if (pendingDeposits) api.add(token, pendingDeposits)
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
