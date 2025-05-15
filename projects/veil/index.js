const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')

// Public Deposit Pools
const DEPOSIT_POOL_PUBLIC_005_ETH = '0x6c206B5389de4e5a23FdF13BF38104CE8Dd2eD5f'
const DEPOSIT_POOL_PUBLIC_05_ETH = '0xC53510D6F535Ba0943b1007f082Af3410fBeA4F7'

// Verified Deposit Pools
const DEPOSIT_POOL_VERIFIED_001_ETH = '0x844bB2917dD363Be5567f9587151c2aAa2E345D2'
const DEPOSIT_POOL_VERIFIED_01_ETH = '0xD3560eF60Dd06E27b699372c3da1b741c80B7D90'
const DEPOSIT_POOL_VERIFIED_1_ETH = '0x9cCdFf5f69d93F4Fcd6bE81FeB7f79649cb6319b'
const DEPOSIT_POOL_VERIFIED_200_USDC = '0xA4dB5eC5d0a2ee01CcD8D6e2e53224CF4E81A9b3'

// VEIL staking contract
const VEIL_TOKEN = '0x767A739D1A152639e9Ea1D8c1BD55FDC5B217D7f'
const VEIL_STAKING_CONTRACT = '0x3225b5a7c842cC227C773636F5C574443C62bb86'

async function tvl(api) {
  const ethPools = [
    DEPOSIT_POOL_PUBLIC_005_ETH,
    DEPOSIT_POOL_PUBLIC_05_ETH,
    DEPOSIT_POOL_VERIFIED_001_ETH,
    DEPOSIT_POOL_VERIFIED_01_ETH,
    DEPOSIT_POOL_VERIFIED_1_ETH,
  ]
  const usdcPools = [DEPOSIT_POOL_VERIFIED_200_USDC]

  // ETH deposits
  await api.sumTokens({ owners: ethPools, tokens: [ADDRESSES.null] })

  // USDC deposits
  await api.sumTokens({ owners: usdcPools, tokens: [ADDRESSES.base.USDC] })
}

module.exports = {
  base: {
    tvl,
    staking: staking(VEIL_STAKING_CONTRACT, VEIL_TOKEN)
  }
}