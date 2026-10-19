const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

//adapter for emit.farm on PulseChain

const EMISSIONS = '0x7Cc0a0ca2f9346AceAdd5110cfa15C4FA12f9251'
const STAKING = '0x6F0BD602147437F2Ce031dE0809b25a721552148'
const EMIT_TOKEN = '0x32fB5663619A657839A80133994E45c5e5cDf427'

const ZERO = ADDRESSES.null

const abi = {
  poolLength: 'uint256:poolLength',
  poolInfo:
    'function poolInfo(uint256) view returns (address token, uint256 allocPoint, uint256 lastRewardTime, uint16 depositFeeBP, uint16 withdrawFeeBP, uint256 accTokensPerShare, bool isStarted, uint8 externalProtocol, address externalFarm, uint256 lpBalance, uint256 externalPid)',
  userInfo: 'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt)',
}

async function pool2(api) {
  const length = Number(await api.call({ target: EMISSIONS, abi: abi.poolLength }))

  const pools = await api.multiCall({
    abi: abi.poolInfo,
    calls: Array.from({ length }, (_, i) => ({ target: EMISSIONS, params: [i] })),
  })

  const localTokens = [...new Set(
    pools.filter(p => p.externalFarm === ZERO).map(p => p.token)
  )]

  const externalPools = pools.filter(p => p.externalFarm !== ZERO)
  if (externalPools.length) {
    const amounts = await api.multiCall({
      abi: abi.userInfo,
      calls: externalPools.map(p => ({ target: p.externalFarm, params: [p.externalPid, EMISSIONS] })),
    })
    externalPools.forEach((p, i) => api.add(p.token, amounts[i].amount))
  }

  return sumTokens2({ api, owner: EMISSIONS, tokens: localTokens, resolveLP: true })
}

async function staking(api) {
  return sumTokens2({ api, owner: STAKING, tokens: [EMIT_TOKEN] })
}

module.exports = {
  methodology:
    'Pool2 TVL counts LP tokens held by the EMISSIONS farming contract (via on-chain balanceOf) for pools that retain LP locally, plus the LP amount staked on behalf of EMISSIONS in PulseX/9Inch MasterChef (via userInfo) for pools with an externalFarm.  Staking TVL counts single-sided EMIT deposited into the EmitRewards staking contract.',
  pulse: {
    tvl: async () => ({}),
    pool2,
    staking,
  },
}
