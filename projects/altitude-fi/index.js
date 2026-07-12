const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')
const vaults = [
  {
    name: 'wstethUsdc v1',
    address: '0x1f7d589e90e4E4FC1B15B3143a5c60F743C759b9',
    supplyToken:'0x874566FfA8d837934aE85Db2209839F5Fb4E6b1d',
    underlyingSupplyToken:ADDRESSES.ethereum.WSTETH, // wstETH
    debtToken:'0xd130a916dDbF1612C2F2FAAb6897210f056Ab29b',
    underlyingBorrowToken:ADDRESSES.ethereum.USDC, // USDC
  },
  {
    name: 'wstethUsdc v2',
    address: '0xaf6062222d00ac63477ad084ebd22a7821e5ee8d',
    supplyToken:'0x5c58dffc753ba61e07a73a021f70366ab69c1f06',
    underlyingSupplyToken:ADDRESSES.ethereum.WSTETH, // wstETH
    debtToken:'0x5717f3f1b566cf2f7113979fcd78d9416f5b0056',
    underlyingBorrowToken:ADDRESSES.ethereum.USDC, // USDC
  },
  {
    name: 'cbbtcUsdc v2',
    address: '0x550F8a1FFC921b9179267F9e7909FC68CE496A6b',
    supplyToken: '0x2Ddd6d576615E6AFa823adeDDe8DC67198333169',
    underlyingSupplyToken: ADDRESSES.ethereum.cbBTC, // cbBTC
    debtToken: '0xDF612bf20C2A68730cEDC5056a1F1A90c6827e66',
    underlyingBorrowToken: ADDRESSES.ethereum.USDC, // USDC
  }
]
const config = {
  vaults
};

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
