// const { gql } = require('graphql-request');

const CONFIG = {
  ethereum: {
    subgraph: 'https://subgraph.satsuma-prod.com/ebe562dbf792/yieldoor--594520/yieldoor-leverager-base/version/v0.0.2/api',
    lendingPool: '',
    lp: [],
    looped: ['0x67d0bde18945999ff517a04fa156189a07ba6543']
  },
  base: {
    subgraph: 'https://subgraph.satsuma-prod.com/ebe562dbf792/yieldoor--594520/yieldoor-leverager-base/version/v0.0.2/api',
    lendingPool: '0xa35b16cec42094f3ba4fd838b13641ec77d23f98',
    lp: [
      '0x8e16c184df379196782e943f4d5a2682a8720cc4',
      '0x92ed462970e63b4fe955937cb1741ef5218b8e40',
      '0x90d8da2839570901f13124ab1a83e92764c7e08f',
      '0xc01403a2466aa7a52a7826a15e5e3bc6b0cd0664'
    ],
    looped: []
  },
  sonic: {
    subgraph: 'https://subgraph.satsuma-prod.com/ebe562dbf792/yieldoor--594520/yieldoor-leverager-sonic/version/v0.0.2/api',
    lendingPool: '0x2300ddbc84ee0c375920d706882b62d1babe1dcb',
    lp: [
      '0x6120de6a13e4496d6c8220bb2a0727ec6350a37f',
      '0xbce4fdcc570855d1f8f7aa2b29a483bdab6cc2df',
      '0x2d4d9ec91b60b2bf29ed1ec5028847dd8237cc17',
      '0x55a9a1444dc5ffeff94090c1e31e1a0c2d5da963',
      '0xea2dcb8f95d2582f3dfcf8fb9c13488e8dfbbfa3',
      '0xdc8bf0e7ff1742898f8e72143f0b8ab4139272e5',
      '0x520e0c1a9071227279b1bec01e2fc93a25c5094e'
    ],
    looped: []
  }   
}

const abis = {
  getPrice: "function getPrice(address asset) view returns (uint256)",
  balances: "function balances() view returns (uint256, uint256)",
  positions: "function positions(uint256) view returns (address denomination, uint256 borrowedAmount, uint256 borrowedIndex, uint256 initCollateralValue, uint256 initCollateralUsd, uint256 initBorrowedUsd, uint256 shares, address vault, address token0, address token1)",
  reservesList: "function reservesList(uint256) view returns (address)",
  reserves: "function reserves(address) view returns (uint256 borrowingIndex, uint256 currentBorrowingRate, uint256 totalBorrows, address yTokenAddress, address stakingAddress, uint256 reserveCapacity, (uint256 utilizationA, uint256 borrowingRateA, uint256 utilizationB, uint256 borrowingRateB, uint256 maxBorrowingRate) borrowingRateConfig, (uint256 maxIndividualBorrow, uint256 LTV, uint256 LLTV) leverageParams, uint256 underlyingBalance, uint128 lastUpdateTimestamp, (bool isActive, bool frozen, bool borrowingEnabled) flags)"
}

// Not used for now, possibly in the future
// const yieldoorReservesQuery = gql`
//   query Reserves {
//     reserves(orderBy: asset) {
//       id
//       asset
//       borrowingIndex
//       currentBorrowingRate
//       totalBorrows
//       yTokenAddress
//       stakingAddress
//       reserveCapacity
//       borrowingRateConfig_utilizationA
//       borrowingRateConfig_borrowingRateA
//       borrowingRateConfig_utilizationB
//       borrowingRateConfig_borrowingRateB
//       borrowingRateConfig_maxBorrowingRate
//       leverageParams_maxIndividualBorrow
//       leverageParams_LTV
//       leverageParams_LLTV
//       underlyingBalance
//       flags_isActive
//       flags_frozen
//       flags_borrowingEnabled
//     }
//   }
// `;

const getVaultBalances = async (api, vaults) => {
  if (!vaults.length) return;

  const [token0s, token1s, balances] = await Promise.all([
    api.multiCall({ calls: vaults, abi: 'address:token0' }),
    api.multiCall({ calls: vaults, abi: 'address:token1' }),
    api.multiCall({ calls: vaults, abi: abis.balances })
  ])

  vaults.forEach((_, i) => {
    const token0 = token0s[i]
    const token1 = token1s[i]
    const [b0, b1] = balances[i]
    api.add(token0, b0)
    api.add(token1, b1)
  })
}

const getMarketBalances = async (api, lendingPool) => {
  if (!lendingPool) return;

  const reservesLists = (await api.fetchList({ target: lendingPool, itemCount: 20, itemAbi: abis.reservesList, permitFailure: true })).filter(Boolean)
  const reservesDatas = await api.multiCall({ calls: reservesLists.map((reserve) => ({ target: lendingPool, params: [reserve] })), abi: abis.reserves })

  for (let i = 0; i < reservesLists.length; i++) {
    const asset = reservesLists[i];
    const { underlyingBalance, totalBorrows, flags } = reservesDatas[i];
    if (!flags.isActive || flags.frozen) continue;
    api.add(asset, Number(underlyingBalance) + Number(totalBorrows));
  }
}

const tvl = async (api) => {
  const { lp, looped, lendingPool } = CONFIG[api.chain]
  await getVaultBalances(api, lp)
  await getMarketBalances(api, lendingPool)
  await api.erc4626Sum({ calls: looped, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' })
}

const borrowed = async (api) => {
  const { lendingPool } = CONFIG[api.chain]

  if (!lendingPool) return;
  const reservesLists = (await api.fetchList({ target: lendingPool, itemCount: 20, itemAbi: abis.reservesList, permitFailure: true })).filter(Boolean)
  const reservesDatas = await api.multiCall({ calls: reservesLists.map((reserve) => ({ target: lendingPool, params: [reserve] })), abi: abis.reserves })

  for (let i = 0; i < reservesLists.length; i++) {
    const asset = reservesLists[i];
    const { totalBorrows, flags } = reservesDatas[i];
    if (!flags.isActive || flags.frozen) continue;
    api.add(asset, Number(totalBorrows));
  }
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = {
    tvl,
    borrowed,
  }
})
