const POOL = '0xf2F67b5Cbf2dEfCB447218ef903bE6AeF5fb2995'

async function tvl(api) {
  const bal = BigInt(await api.getEthBalance(POOL))
  const accruedFees = BigInt(await api.call({ target: POOL, abi: 'uint256:accruedProtocolFees' }))

  if (bal < accruedFees) throw new Error('Nullark fees exceeds balance')

  api.addGasToken(bal - accruedFees)
}

module.exports = {
  methodology: 'Native ETH principal represented by unspent Nullark notes, calculated as pool native balance minus accrued protocol fees.',
  start: '2026-09-03',
  robinhood: { tvl },
}
