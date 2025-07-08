const ADDRESSES = require('../helper/coreAssets.json')
const VE_VELO_ABI = require('./abi/VeVeloNFT.json');
const { createIncrementArray } = require('../helper/utils');
const { sumTokens2 } = require('../helper/unwrapLPs')

const CAVIAR_CHEF_ABI = require('./abi/CaviarChef.json');

const insuranceTokens = {
  CAVIAR: '0x6AE96Cc93331c19148541D4D2f31363684917092',
  DAI: ADDRESSES.polygon.DAI,
  PEARL: '0x7238390d5f6F64e67c3211C343A410E2A3DEc142',
  STAR: '0xC19669A405067927865B40Ea045a2baabbbe57f5',
  STMATIC: '0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4',
  TETU: '0x255707B70BF90aa112006E1b07B9AeA6De021424',
  TNGBL: '0x49e6A20f1BBdfEeC2a8222E052000BbB14EE6007',
  USDC: ADDRESSES.polygon.USDC,
  USDR: '0x40379a439D4F6795B6fc9aa5687dB461677A2dBa',
  USDT: ADDRESSES.polygon.USDT,
  WETH: ADDRESSES.polygon.WETH_1,
  WMATIC: ADDRESSES.polygon.WMATIC_2,
  WUSDR: '0x00e8c0E92eB3Ad88189E7125Ec8825eDc03Ab265',
  TETU_BPT: '0xE2f706EF1f7240b803AAe877C9C762644bb808d8',
}

const UTILITY_TOKENS = {
  VE_PEARL: '0x017A26B18E4DA4FE1182723a39311e67463CF633',
  VE_TETU: '0x6FB29DD17fa6E27BD112Bc3A2D0b8dae597AeDA4',
}

const CAVIAR_STAKING_CHEF = '0x83C5022745B2511Bd199687a42D27BEFd025A9A9';
const CAVIAR_REBASE_CHEF = '0xf5374d452697d9A5fa2D97Ffd05155C853F6c1c6';
const PEARL_PAIR_FACTORY = '0xEaF188cdd22fEEBCb345DCb529Aa18CA9FcB4FBd';
const PEARL_VOTER = '0xa26C2A6BfeC5512c13Ae9EacF41Cb4319d30cCF0';

async function getInsuranceFundValue(api, INSURANCE_FUND) {
  await Promise.all([
    addVePearlBal(api, INSURANCE_FUND),
    addVeTetuBal(api, INSURANCE_FUND),
    caviarTvl(api, INSURANCE_FUND),
    pearlFactoryTvl(api, INSURANCE_FUND),
  ])
  return sumTokens2({ api, owner: INSURANCE_FUND, tokens: Object.values(insuranceTokens), resolveUniV3: true, resolveLP: true, blacklistedTokens: [
    insuranceTokens.USDR,
    insuranceTokens.WUSDR,
    insuranceTokens.TNGBL,
  ] })
}

async function caviarTvl(api, owner) {
  const [
    stakingAmount, pendingStakingReward, stakingRewardToken, pendingRebaseReward, rebaseRewardToken
  ] = await Promise.all([
    api.call({ target: CAVIAR_STAKING_CHEF, abi: CAVIAR_CHEF_ABI.userInfo, params: [owner] }),
    api.call({ target: CAVIAR_STAKING_CHEF, abi: CAVIAR_CHEF_ABI.pendingReward, params: [owner] }),
    api.call({ target: CAVIAR_STAKING_CHEF, abi: CAVIAR_CHEF_ABI.rewardToken, }),
    api.call({ target: CAVIAR_REBASE_CHEF, abi: CAVIAR_CHEF_ABI.pendingReward, params: [owner] }),
    api.call({ target: CAVIAR_REBASE_CHEF, abi: CAVIAR_CHEF_ABI.rewardToken, }),
  ])

  // api.add(stakingRewardToken, pendingStakingReward); // it is wUSDR
  api.add(rebaseRewardToken, pendingRebaseReward);
  api.add(insuranceTokens.CAVIAR, stakingAmount.amount);
}

async function pearlFactoryTvl(api, owner) {
  const pairs = await api.fetchList({ lengthAbi: 'uint256:allPairsLength', itemAbi: "function allPairs(uint256) view returns (address)", target: PEARL_PAIR_FACTORY })
  const gauges = await api.multiCall({ abi: "function gauges(address) view returns (address)", calls: pairs, target: PEARL_VOTER })
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: gauges.map(g => ({ target: g, params: owner })) })
  bals.forEach((bal, i) => {
    if (pairs[i].toLowerCase() !== '0x0edc235693c20943780b76d79dd763236e94c751')
      api.add(pairs[i], bal)
  })
}

async function addVePearlBal(api, INSURANCE_FUND) {
  const count = await api.call({ abi: 'erc20:balanceOf', target: UTILITY_TOKENS.VE_PEARL, params: INSURANCE_FUND })
  const tokenIds = await api.multiCall({ abi: VE_VELO_ABI.tokenOfOwnerByIndex, calls: createIncrementArray(count).map(i => ({ params: [INSURANCE_FUND, i] })), target: UTILITY_TOKENS.VE_PEARL })
  const bals = await api.multiCall({ abi: VE_VELO_ABI.lockedPearl, calls: tokenIds, target: UTILITY_TOKENS.VE_PEARL })
  bals.forEach(i => api.add(insuranceTokens.PEARL, i.amount))
}

async function addVeTetuBal(api, INSURANCE_FUND) {
  const count = await api.call({ abi: 'erc20:balanceOf', target: UTILITY_TOKENS.VE_TETU, params: INSURANCE_FUND })
  const tokenIds = await api.multiCall({ abi: VE_VELO_ABI.tokenOfOwnerByIndex, calls: createIncrementArray(count).map(i => ({ params: [INSURANCE_FUND, i] })), target: UTILITY_TOKENS.VE_TETU })
  const bals = await api.multiCall({ abi: VE_VELO_ABI.lockedAmounts, calls: tokenIds.map(i => ({ params: [i, insuranceTokens.TETU_BPT] })), target: UTILITY_TOKENS.VE_TETU })
  bals.forEach(i => api.add(insuranceTokens.TETU_BPT, i))
}


module.exports = {
  getInsuranceFundValue,
  insuranceTokens
}
