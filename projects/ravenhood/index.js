const { unwrapUniswapV3NFT } = require('../helper/unwrapLPs')

const RVH_TOKEN = '0x96765066f6a040a21EB027167D2315B707c82633'
const STAKING_POOL = '0xAc558b558E228DE033Cd97C580618C4403CB05a6'
// RavenhoodVault: immutable custodian holding the protocol's single permanently-locked
// RVH/WETH Uniswap V3 position (95% of supply, single-sided at launch, tokenId 17757).
const VAULT = '0x5e1485137E025bf7774F52DE4E33fa6E498f6ede'
const POSITION_MANAGER = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'

module.exports = {
  methodology: 'TVL is the RVH/WETH locked in the Uniswap V3 position held by RavenhoodVault (the permanently-locked launch liquidity). Staking is RVH deposited into RVHStakingPool.',
  robinhood: {
    tvl: async (api) => {
      const balances = {}
      await unwrapUniswapV3NFT({ balances, api, owner: VAULT, nftAddress: POSITION_MANAGER })
      return balances
    },
    staking: async (api) => {
      const staked = await api.call({ target: STAKING_POOL, abi: 'uint256:totalStaked' })
      api.add(RVH_TOKEN, staked)
      return api.getBalances()
    },
  },
}
