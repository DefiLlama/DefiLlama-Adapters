const { staking } = require('../helper/staking')

const UNICHAIN_GAMMA_VAULT = '0xf9aDaa55014242c1005dB307C4e41c541f26bAAA'
const BETS = '0x94025780a1aB58868D9B2dBBB775f44b32e8E6e5'
async function fetchBetsFromGammaVault({ api, gammaVault }) {
  const [
    token0Address, token1Address, balances,
  ] = await Promise.all([
    api.call({ abi: 'address:token0', target: gammaVault}),
    api.call({ abi: 'address:token1', target: gammaVault}),
    api.call({ abi: 'function getTotalAmounts() view returns (uint256 token0Bal, uint256 token1Bal)', target: gammaVault}),
  ])
  api.add(token0Address, balances[0])
  api.add(token1Address, balances[1])
}

module.exports = {
  methodology: "TVL counts BETS tokens on the staking contracts AND Gamma UniSwap V4 LP tokens.",
  start: '2023-06-25',
  bsc: {
    staking: staking('0x20Df34eBe5dCB1082297A18BA8d387B55fB975a0', BETS),
  },
  polygon: {
    staking: staking('0xA0D5F23dc9131597975afF96d293E5a7d0516665', BETS),
  },
  avax: {
    staking: staking('0x9913EffA744B72385E537E092710072D21f8BC98', BETS),
  },
  arbitrum: {
    staking: staking('0xA7Dd05a6CFC6e5238f04FD6E53D4eFa859B492e4', BETS),
  },
  base: {
    staking: staking('0x585ae1667d83E93f77ebEb6BbC6d4c19A3879248', BETS),
  },
  unichain: {
    tvl: () => ({}),
    pool2: async (api) => {
      await fetchBetsFromGammaVault({ api, gammaVault: UNICHAIN_GAMMA_VAULT })
    },
  },
};
