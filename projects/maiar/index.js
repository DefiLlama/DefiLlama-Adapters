const { default: PromisePool } = require('@supercharge/promise-pool')
const { call, queryContractWithAbi, getTokenData, toBech32 } = require("../helper/chain/elrond");

// https://github.com/multiversx/mx-exchange-sc
const ROUTER = 'erd1qqqqqqqqqqqqqpgqq66xk9gfr4esuhem3jru86wg5hvp33a62jps2fy57p'
const PAIR_METADATA_TYPES = {
  PairContractMetadata: {
    type: 'struct',
    fields: [
      { name: 'first_token_id', type: 'TokenIdentifier' },
      { name: 'second_token_id', type: 'TokenIdentifier' },
      { name: 'address', type: 'Address' },
    ],
  },
}

// single-token staking farms (there is no on-chain registry of them, list comes from graph.xexchange.com stakingFarms)
const STAKING_FARMS = [
  'erd1qqqqqqqqqqqqqpgqmqq78c5htmdnws8hm5u4suvags36eq092jpsaxv3e7', // RIDE
  'erd1qqqqqqqqqqqqqpgqr7kdhagkqgxvjrsk7s5333l9wwnenr9g2jps8puq33', // ZPAY
  'erd1qqqqqqqqqqqqqpgqzps75vsk97w9nsx2cenv2r2tyxl4fl402jpsx78m9j', // ITHEUM
  'erd1qqqqqqqqqqqqqpgq45zs77q884ts6y9zj4jyqfn6ydev8ruv2jps3tteqq', // BHAT
  'erd1qqqqqqqqqqqqqpgqcedkmj8ezme6mtautj79ngv7fez978le2jps8jtawn', // UTK
  'erd1qqqqqqqqqqqqqpgqp2wfzvkhlpkwcdxx25qzznx33345979w2jpsl3gflj', // CRT
  'erd1qqqqqqqqqqqqqpgqjdlnu9ggwfc79pygn5fjjgmdm6d7vu5e2jpsw59amp', // ASH
  'erd1qqqqqqqqqqqqqpgqqsx29p3fge7upkgup4mm5xsdsv4w7rh82jpsdcvdrt', // HTM
  'erd1qqqqqqqqqqqqqpgqnyq8k8nfurx5rz7zxudfeeqm983uw2tvkp2shvf2ls', // TADA
  'erd1qqqqqqqqqqqqqpgqt54tw2djktfa2ap8w82x37545l58ehjdkp2svarslw', // BOBER
  'erd1qqqqqqqqqqqqqpgq8vl7tah2auv256864pmg9885l6gs4jp3x9rs50k5x6', // RARE
  'erd1qqqqqqqqqqqqqpgquttd35eztflu2apsnyewmxtsg5h9mynhx9rswhur9y', // HYPE
  'erd1qqqqqqqqqqqqqpgq2e4fmlhcv90wrxl2acjpcu3g2l9rpkttx9rs8pppzp', // FOXSY
  'erd1qqqqqqqqqqqqqpgqlrl09kdjlwjdwrk8amtv5slavcundcn8x9rsjhfg4r', // TTG
  'erd1qqqqqqqqqqqqqpgq32amphk0hks57az4q3wmx0ejtwjw0970x9rs3rzc5e', // BEE
  'erd1qqqqqqqqqqqqqpgqthsqzc2vt376adr6p6k737f4j8jr8kwtx9rs072zu5', // DNA
  'erd1qqqqqqqqqqqqqpgqy99zff7cv26l8psw2azwkhptc2lapj5nkp2sjtn3j9', // XOXNO
  'erd1qqqqqqqqqqqqqpgqv9h8yej6gdddmpdcad96fukxgutvr2sfkp2s7pe5gg', // A1X
  'erd1qqqqqqqqqqqqqpgqf0tlpqkkg7e6mc76ayap6wynktnfmdzmkp2sc67v5w', // DRX
  'erd1qqqqqqqqqqqqqpgqazrruw6kh5cr3xdumyqx49ac09gr5sj7kp2s30u6hl', // BOD
  'erd1qqqqqqqqqqqqqpgqjcatffrexdyd097ps5gvp4h8h9hsp2jkkp2sgewvwk', // BATEMAN
  'erd1qqqqqqqqqqqqqpgq5x2x5xzm35x6nr4arrfl7zd47kz6xjzhkp2svp3z30', // VILLER
  'erd1qqqqqqqqqqqqqpgqfnrln7ygyxdj96749e586lqwl8wr2fxskp2skn495u', // ROAR
]

const MEX = 'MEX-455c57'
const XMEX = 'XMEX-fda355'

async function runQueries(items, fn) {
  const { errors } = await PromisePool.withConcurrency(4).for(items).process(fn)
  if (errors.length) throw errors[0]
}

// every pair the router deployed, reserves read from the pair itself.
// Most pairs are TOKEN/WEGLD or TOKEN/USDC and the long tail of TOKENs is unpriced or mispriced,
// so a pair with a core side is valued as twice that side, the same way sumUnknownTokens does on EVM
const CORE_TOKENS = ['WEGLD-bd4d79', 'USDC-c76f1f', 'USDT-f8c08c']
async function tvl(api) {
  const pairs = await queryContractWithAbi({ target: ROUTER, funcName: 'getAllPairContractMetadata', outputType: 'PairContractMetadata', abiTypes: PAIR_METADATA_TYPES, multiValue: true })
  await runQueries(pairs, async ({ first_token_id, second_token_id, address }) => {
    const [reserve0, reserve1] = await call({ target: toBech32(address), abi: 'getReservesAndTotalSupply', responseTypes: ['number', 'number', 'number'] })
    const reserves = [[first_token_id, reserve0], [second_token_id, reserve1]]
    const core = reserves.find(([token]) => CORE_TOKENS.includes(token))
    if (core) return api.add(core[0], BigInt(core[1]) * 2n)
    reserves.forEach(([token, reserve]) => api.add(token, reserve))
  })
}

// Locking MEX burns it and mints xMEX 1:1, so the outstanding xMEX supply is the locked MEX.
async function stakingAndLockedMEX(api) {
  const xmex = await getTokenData(XMEX)
  api.add(MEX, (BigInt(xmex.minted) - BigInt(xmex.burnt)).toString())
  await runQueries(STAKING_FARMS, async (farm) => {
    const token = await queryContractWithAbi({ target: farm, funcName: 'getFarmingTokenId', outputType: 'TokenIdentifier' })
    const supply = await call({ target: farm, abi: 'getFarmTokenSupply', responseTypes: ['number'] })
    api.add(token, supply)
  })
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  elrond: {
    tvl,
    staking: stakingAndLockedMEX,
  },
}
