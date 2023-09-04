const GENESIS_REWARD_POOL = "0x4F4014EC1685699290A311E0A159E1E39914853F";

async function tvl(_, _b, _cb, { api, }) {
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

const poolInfoAbi = "function poolInfo(uint256) view returns (address token, uint256 allocPoint, uint256 lastRewardTime, uint256 accBasedPerShare, bool isStarted)"

module.exports = {
  methodology: 'TVL is based on value of the single-sided staked tokens inside of the Genesis reward pool.',
  base: { tvl },
};
