const sdk = require('@defillama/sdk');
const config = require('./addresses')


async function ethereum(includeBorrowed = false) {
  const api = new sdk.ChainApi({ chain: 'ethereum' })
  if (!config.vaults) return {}

  const calls = config.vaults.map(vault => ({
    target: vault.supplyToken,
  }))

  const balances = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls,
  })

  const vaultBorrowCalls = config.vaults.map(vault => ({
    target: vault.debtToken,
    params: [vault.address]
  }))

  const totalBorrowCalls = config.vaults.map(vault => ({
    target: vault.debtToken,
  }))

  const vaultBorrowBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: vaultBorrowCalls,
  })

  const totalBorrow = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: totalBorrowCalls,
  })

  if (!includeBorrowed) {
    config.vaults.forEach((vault, i) => {
      const balance = balances[i]
      api.add(vault.underlyingSupplyToken, balance)
    })

    // Subtract borrowed amounts from TVL
    config.vaults.forEach((vault, i) => {
      const vaultBorrowBalance = vaultBorrowBalances[i]
      const totalBorrowBalance = totalBorrow[i]
      const netBorrow = totalBorrowBalance - vaultBorrowBalance
      api.add(vault.underlyingBorrowToken, -netBorrow)  // Subtract from TVL
    })
  } else {
    config.vaults.forEach((vault, i) => {
      const vaultBorrowBalance = vaultBorrowBalances[i]
      const totalBorrowBalance = totalBorrow[i]
      const usersBorrow = totalBorrowBalance - vaultBorrowBalance
      api.add(vault.underlyingBorrowToken, usersBorrow)  // Only USDC
    })
  }

  return api.getBalances()
}

module.exports = {
  ethereum: {
    tvl: () => ethereum(false),
    borrowed: () => ethereum(true),
  },
  doublecounted: true,
  methodology: 'TVL is calculated by summing the total value of tokens locked across all Altitude Finance vaults minus user borrows.'
} 
