const sdk = require('@defillama/sdk');
const config = require('./addresses')

async function calculateBorrowAmounts(api, config) {
  const vaultBorrowCalls = config.vaults.map(vault => ({
    target: vault.debtToken,
    params: [vault.address]
  }))

  const totalBorrowCalls = config.vaults.map(vault => ({
    target: vault.debtToken,
  }))

  const [vaultBorrowBalances, totalBorrow] = await Promise.all([
    api.multiCall({
      abi: 'erc20:balanceOf',
      calls: vaultBorrowCalls,
    }),
    api.multiCall({
      abi: 'erc20:totalSupply',
      calls: totalBorrowCalls,
    })
  ])

  return config.vaults.map((vault, i) => {
    const vaultBorrowBalance = vaultBorrowBalances[i]
    const totalBorrowBalance = totalBorrow[i]
    const usersBorrow = totalBorrowBalance - vaultBorrowBalance
    return {
      vault,
      usersBorrow,
      underlyingBorrowToken: vault.underlyingBorrowToken
    }
  })
}

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

  if (!includeBorrowed) {
    // Add supply token balances
    config.vaults.forEach((vault, i) => {
      const balance = balances[i]
      api.add(vault.underlyingSupplyToken, balance)
    })

    // Subtract borrowed amounts from TVL
    const borrowData = await calculateBorrowAmounts(api, config)
    borrowData.forEach(({ usersBorrow, underlyingBorrowToken }) => {
      api.add(underlyingBorrowToken, -usersBorrow)
    })
  } else {
    // Only add borrowed amounts by user
    const borrowData = await calculateBorrowAmounts(api, config)
    borrowData.forEach(({ usersBorrow, underlyingBorrowToken }) => {
      api.add(underlyingBorrowToken, usersBorrow)
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
  methodology: 'TVL is calculated by counting the tokens locked in the contracts to be used as collateral to borrow or to earn yield. User borrows are not counted towards the TVL.'
} 
