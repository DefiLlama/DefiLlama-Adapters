const POOL = '0xf2F67b5Cbf2dEfCB447218ef903bE6AeF5fb2995'
const DEPLOYMENT_BLOCK = 53812864n

async function tvl(api) {
  if (api.block !== undefined && BigInt(api.block) < DEPLOYMENT_BLOCK) return

  const [deposited, withdrawn, accruedFees] = await Promise.all([
    api.call({ target: POOL, abi: 'uint256:totalDepositedAccounting' }),
    api.call({ target: POOL, abi: 'uint256:totalWithdrawnAccounting' }),
    api.call({ target: POOL, abi: 'uint256:accruedProtocolFees' }),
  ])

  const depositedWei = BigInt(deposited)
  const withdrawnAndFeesWei = BigInt(withdrawn) + BigInt(accruedFees)
  if (withdrawnAndFeesWei > depositedWei)
    throw new Error('Nullark accounting exceeds deposits')

  api.addGasToken(depositedWei - withdrawnAndFeesWei)
}

module.exports = {
  methodology:
    'Native ETH principal represented by unspent Nullark notes, calculated as cumulative deposits minus cumulative net withdrawals and cumulative protocol fees. Protocol fees and excess ETH are excluded.',
  robinhood: { tvl },
}
