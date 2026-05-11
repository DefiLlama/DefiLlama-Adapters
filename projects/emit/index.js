const { sumTokens2 } = require('../helper/unwrapLPs')

//adapter for emit.farm on PulseChain

const EMISSIONS = '0x7Cc0a0ca2f9346AceAdd5110cfa15C4FA12f9251'
const STAKING = '0x6F0BD602147437F2Ce031dE0809b25a721552148'
const EMIT_TOKEN = '0x32fB5663619A657839A80133994E45c5e5cDf427'

const abi = {
  poolLength: 'uint256:poolLength',
  poolInfo:
    'function poolInfo(uint256) view returns (address token, uint256 allocPoint, uint256 lastRewardTime, uint16 depositFeeBP, uint16 withdrawFeeBP, uint256 accTokensPerShare, bool isStarted, uint8 externalProtocol, address externalFarm, uint256 lpBalance, uint256 externalPid)',
  totalSupply: 'uint256:totalSupply',
}

async function pool2(api) {
  const length = Number(await api.call({ target: EMISSIONS, abi: abi.poolLength }))

  const pools = await api.multiCall({
    abi: abi.poolInfo,
    calls: Array.from({ length }, (_, i) => ({
      target: EMISSIONS,
      params: [i],
    })),
  })

  for (const pool of pools) {
    if (!pool.lpBalance || pool.lpBalance === '0') continue
    api.add(pool.token, pool.lpBalance)
  }

  return sumTokens2({ api, resolveLP: true })
}

async function staking(api) {
  const stakedEmit = await api.call({
    target: STAKING,
    abi: abi.totalSupply,
  })

  api.add(EMIT_TOKEN, stakedEmit)
}

module.exports = {
  methodology:
    'Pool2 TVL counts LP tokens deposited into the EMISSIONS farming contract using poolInfo(pid).lpBalance and unwraps LPs. Staking TVL counts single-sided EMIT deposited into the EmitRewards staking contract using totalSupply().',
  pulse: {
    tvl: async () => ({}),
    pool2,
    staking,
  },
}
