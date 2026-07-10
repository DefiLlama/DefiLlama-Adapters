const { unwrapUniswapV3NFT } = require('../helper/unwrapLPs')

// RavenhoodVault — permanently locked RVH/WETH Uniswap V3 position.
// Verified on-chain 2026-07-11: holds exactly 1 NFT on the position manager below.
const VAULT = '0x5e1485137E025bf7774F52DE4E33fa6E498f6ede'
const UNISWAP_V3_NFT_MANAGER = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const RVH_TOKEN = '0x96765066f6a040a21EB027167D2315B707c82633'
const STAKING_POOL = '0xAc558b558E228DE033Cd97C580618C4403CB05a6'

module.exports = {
  methodology: 'TVL is the RVH/WETH Uniswap V3 position permanently locked in RavenhoodVault (seeded single-sided at launch with 95M RVH, now accumulating both sides from swap fees and buybacks). Staking is RVH deposited into RVHStakingPool.',
  robinhood: {
    tvl: async (api) => {
      await unwrapUniswapV3NFT({ api, owner: VAULT, nftAddress: UNISWAP_V3_NFT_MANAGER })
      return api.getBalances()
    },
    staking: async (api) => {
      const staked = await api.call({ target: STAKING_POOL, abi: 'uint256:totalStaked' })
      api.add(RVH_TOKEN, staked)
      return api.getBalances()
    },
  },
}
