const { sumUnknownTokens } = require('../helper/unknownTokens');

const GENESIS_REWARD_POOL = "0x4F4014EC1685699290A311E0A159E1E39914853F";
const poolInfoAbi = "function poolInfo(uint256) view returns (address token, uint256 allocPoint, uint256 lastRewardTime, uint256 accBasedPerShare, bool isStarted)";

async function tvl(api) {
  const tokens = []
  let gotError = false
  let i = 0
  do {
    try {
      const poolInfo = await api.call({ abi: poolInfoAbi, target: GENESIS_REWARD_POOL, params: i })
      tokens.push(poolInfo.token)
    } catch (e) {
      gotError = true
    }
    i++
  } while (!gotError)
  return api.sumTokens({ owner: GENESIS_REWARD_POOL, tokens })
}

async function pool2(api) {
  const pools = [
    { // BasedRewardPool
      'pool2Address': '0x5F45e48F9C053286cE9Ca08Db897f8b7eb3f7992',
      'stakingContract': '0x8A75C6EdD19d9a72b31774F1EE2BC45663d30733'
    },
    { // bShareRewardPool
      'pool2Address': '0xbE23ce31C665225E27521D3d7DB9Bb7E5A76aeb8',
      'stakingContract': '0x227F33775f1320959bAA17280310Fab9ACc4Aa6C'
    }
  ];
  const gaugeBal = await api.call({ target: '0xa7919a78183d4b3980c01dfdacd0158772eb5632', abi: 'erc20:balanceOf', params: '0x227F33775f1320959bAA17280310Fab9ACc4Aa6C'})
  api.add('0xbE23ce31C665225E27521D3d7DB9Bb7E5A76aeb8', gaugeBal)

  const tokensAndOwners = pools.map(i => ([i.pool2Address, i.stakingContract]));

  return sumUnknownTokens({ tokensAndOwners, useDefaultCoreAssets: true, api, resolveLP: true,  });
}

module.exports = {
  methodology: 'TVL is based on value of the single-sided staked tokens inside of the Genesis reward pool. Pool2 TVL represents the value of specific LP tokens staked in designated pool2 staking contracts(BasedRewardPool & bShareRewardPool)',
  base: { tvl, pool2 },
};
