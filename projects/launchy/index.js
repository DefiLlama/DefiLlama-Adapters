const { call, multiCall } = require('../helper/chain/starknet')

const POSITIONS = '0x02e0af29598b407c8716b17f6d2795eca1b471413fa03fb145a5e33722184067'
const POSITIONS_NFT = '0x07b696af58c967c1b14c9dde0ace001720635a660a8e90c565ea459345318b30'

// The original, retired V3, current V3, and V4 factories retain their LP NFTs.
// Retired factories are included because their liquidity remains in Ekubo.
const FACTORIES = [
  '0x63883bfd87f65a2e42193f0f5cf18eb69d983abb99b07f7ec9a561b11c85ef4',
  '0x2dab18d11e9484606c460b5fe55f4c21da11b855adedcfb6bf838e8a814c136',
  '0x38948e1e6887b2f6614561a41f6e82787a9c2747bfae89991a105f64b5c3604',
  '0xb6754da1f60bf4305b0a49bd2db208072a9fccebbee03604706889da2f85ab',
]

function abi(name, inputs, outputs) {
  return {
    name, type: 'function', customInput: 'address',
    inputs: inputs.map((name) => ({ name, type: 'felt' })),
    outputs: outputs.map((name) => ({ name, type: 'felt' })),
  }
}

const ABIS = {
  deployedCount: abi('deployed_count', [], ['count']),
  deployedToken: abi('deployed_token', ['index'], ['token']),
  positionId: abi('ekubo_position_id', ['token'], ['id']),
  poolConfig: abi('pool_config', ['token'], ['token0', 'token1', 'fee', 'tickSpacing', 'extension']),
  launchData: abi('launch_data', [], [
    'option', 'quote', 'quoteAmountLow', 'quoteAmountHigh', 'antiBotSeconds',
    'maxBuyBps', 'fee', 'tickSpacing', 'startMag', 'startNegative', 'bound',
    'launcher', 'launchedAt',
  ]),
  ownerOf: abi('ownerOf', ['idLow', 'idHigh'], ['owner']),
  tokenInfo: abi('get_token_info', ['id', 'poolKey', 'bounds'], [
    'sqrtRatioLow', 'sqrtRatioHigh', 'tickMag', 'tickNegative', 'liquidity',
    'amount0', 'amount1', 'fees0', 'fees1',
  ]),
}

const same = (a, b) => BigInt(a) === BigInt(b)
const hex = (value) => `0x${BigInt(value).toString(16)}`

async function starknetTvl(api) {
  for (const factory of FACTORIES) {
    const count = Number(await call({ target: factory, abi: ABIS.deployedCount }))
    const tokens = await multiCall({
      target: factory, abi: ABIS.deployedToken,
      calls: Array.from({ length: count }, (_, index) => ({ params: [index] })),
    })
    if (!tokens.length) continue

    const ids = await multiCall({
      target: factory, abi: ABIS.positionId,
      calls: tokens.map((token) => ({ params: [token] })),
    })
    const launched = tokens.map((token, index) => ({ token, id: ids[index] }))
      .filter(({ id }) => BigInt(id) > 0n)
    if (!launched.length) continue

    const [owners, pools, launches] = await Promise.all([
      multiCall({ target: POSITIONS_NFT, abi: ABIS.ownerOf,
        calls: launched.map(({ id }) => ({ params: [id, 0] })) }),
      multiCall({ target: factory, abi: ABIS.poolConfig,
        calls: launched.map(({ token }) => ({ params: [token] })) }),
      multiCall({ abi: ABIS.launchData,
        calls: launched.map(({ token }) => ({ target: hex(token), params: [] })) }),
    ])

    const infoCalls = []
    const quotes = []
    launched.forEach(({ id }, index) => {
      if (!same(owners[index], factory)) return
      const pool = pools[index]
      const launch = launches[index]
      if (!same(launch.option, 0) || !same(launch.fee, pool.fee)
        || !same(launch.tickSpacing, pool.tickSpacing)) throw new Error('Invalid Launchy pool')
      const quoteIsToken1 = same(launch.quote, pool.token1)
      if (!quoteIsToken1 && !same(launch.quote, pool.token0)) throw new Error('Unknown Launchy quote')

      const start = BigInt(launch.startMag)
      const bound = BigInt(launch.bound)
      // The factories store already-aligned bounds in each token's launch_data.
      const lower = quoteIsToken1 ? [start, launch.startNegative] : [bound, 1]
      const upper = quoteIsToken1 ? [bound, 0] : [start, 1n - BigInt(launch.startNegative)]
      infoCalls.push({ target: POSITIONS, params: [
        id, pool.token0, pool.token1, pool.fee, pool.tickSpacing, pool.extension,
        hex(lower[0]), hex(lower[1]), hex(upper[0]), hex(upper[1]),
      ] })
      quotes.push({ token: hex(launch.quote), isToken1: quoteIsToken1 })
    })

    const infos = await multiCall({ abi: ABIS.tokenInfo, calls: infoCalls })
    infos.forEach((info, index) => {
      const amount = quotes[index].isToken1 ? info.amount1 : info.amount0
      api.add(quotes[index].token, amount)
    })
  }
  return api.getBalances()
}

module.exports = {
  methodology: 'Counts only the STRK or ZEC principal in Ekubo LP positions minted by Launchy factories and still held by those factories. Launch-token principal and unclaimed fees are excluded. Ekubo also counts these pools.',
  doublecounted: true,
  timetravel: false,
  starknet: { tvl: starknetTvl },
}
