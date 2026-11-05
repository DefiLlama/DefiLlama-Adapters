const { uniV4HookOnChainExport } = require('../helper/uniswapV4')
const { uniV3Export } = require('../helper/uniswapV3')
const { staking } = require('../helper/staking')

const chain = 'elysium_hyperevm'

// Helios DLMM and DAMM pools are Uniswap v4 pools running the Helios fee hook, in the PoolManager shared
// with other venues on Elysium: they're found by their hook from the PoolManager's Initialize logs.
const v4 = uniV4HookOnChainExport({
  hook: '0xa129c69D439f30e6FfACC435a1627b7f4F9d30c4',
  poolManager: '0xE2e105d3F7209A9DA11f83cCf3E7398a753823F1',
  stateView: '0x27eD73aE0652fdCf71d6793412A7525f32bE9dfE',
  fromBlock: 412978,
})

// Helios v3 pools, from its own Uniswap v3 factory
const v3 = uniV3Export({ [chain]: { factory: '0x626005cA43F45568AD5f084087e5ae7cbba04e06', fromBlock: 139831 } })[chain].tvl

const HELIOS = '0x792aa7771e4e1bd58f84631c915ae98aef45277e'
const HELIOS_STAKING = '0x8cef6b7b09Da069a49d3f44b774d2106Ed1a912C'

module.exports = {
  methodology: 'TVL is the liquidity in Helios pools on Elysium: its DLMM and DAMM pools (Uniswap v4 pools with the Helios fee hook, reserves rebuilt from each pool\'s ticks and price) and its Uniswap v3 pools. Staking is HELIOS staked in HeliosStaking.',
  [chain]: {
    tvl: async (api) => {
      await v4(api)
      await v3(api)
    },
    staking: staking(HELIOS_STAKING, HELIOS),
  },
}
