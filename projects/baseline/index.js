const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const RELAY = '0xc81fd894c0ace037d133af4886550ac8133568e8'
const B_ADDRESS = '0x9fDbDE76236998Dc2836FE67A9954eDE456A1D63'

const POOL_CREATED_EVENT = 'event PoolCreated(address bTokenAddress,address reserveAddress,address creator,address feeRecipient,uint256 creatorFeePct,uint256 initialActivePrice,uint256 initialBlvPrice,uint256 totalReserves,uint256 totalBTokens,uint256 totalCollateral,uint256 totalDebt,bytes32 poolId)'

const config = {
  ethereum: {
    relay: RELAY,
    fromBlock: 24920863,
    reserves: [
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.cbBTC,
    ],
  },
  base: {
    relay: RELAY,
    fromBlock: 45070267,
    reserves: [
      ADDRESSES.base.WETH,
      ADDRESSES.base.cbBTC,
      ADDRESSES.base.USDC,
      ADDRESSES.base.USDT,
      ADDRESSES.base.WBTC,
      '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b', // VIRTUAL
    ],
  },
}

async function getPools(api) {
  const { relay, fromBlock } = config[api.chain]

  return getLogs2({
    api,
    target: relay,
    fromBlock,
    eventAbi: POOL_CREATED_EVENT,
    onlyArgs: true,
  })
}

async function addPoolMetric(api, metric, tokenGetter) {
  const { relay } = config[api.chain]
  const pools = await getPools(api)
  const amounts = await api.multiCall({
    target: relay,
    abi: `function ${metric}(address) view returns (uint256)`,
    calls: pools.map(i => i.bTokenAddress),
  })

  pools.forEach((pool, i) => api.add(tokenGetter(pool), amounts[i]))
}

async function tvl(api) {
  const { relay, reserves } = config[api.chain]
  return api.sumTokens({ owner: relay, tokens: reserves })
}

async function borrowed(api) {
  return addPoolMetric(api, 'totalDebt', pool => pool.reserveAddress)
}

async function staking(api) {
  const { relay } = config[api.chain]
  const amount = await api.call({
    target: relay,
    abi: 'function totalStaked(address) view returns (uint256)',
    params: [B_ADDRESS],
  })

  api.add(B_ADDRESS, amount)
}

module.exports = {
  ethereum: {
    tvl,
    borrowed,
    staking,
  },
  base: {
    tvl,
    borrowed,
  },
  blast: {
    tvl: () => ({}),
  },
  methodology: 'TVL counts reserve assets held as liquidity in Baseline Mercury pools. Borrowed counts reserve assets lent from those pools to borrowers and is reported separately. Staking counts staked $B, which is the platform\'s token.',
  hallmarks: [
    ['2024-04-27', 'self-whitehack'],
    ['2026-04-21', 'Mercury launch'],
  ],
}
