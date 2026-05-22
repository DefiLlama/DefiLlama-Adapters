const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const VIRTUAL = '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b'
const FFACTORY = '0xD7D3C85B4f2e9bee1998cD2E98820e647792d284'
const STAKING = '0x60a203ddcde45fbfb325bdeea93824b5726b4df8'

const PAIR_CREATED = 'event PairCreated(address indexed tokenA, address indexed tokenB, address pair, uint256)'

async function staking(api) {
  const logs = await getLogs2({
    api,
    target: FFACTORY,
    fromBlock: 36529894,
    eventAbi: PAIR_CREATED,
  })

  const pairs = logs
    .filter(l => l.tokenA.toLowerCase() === VIRTUAL.toLowerCase() || l.tokenB.toLowerCase() === VIRTUAL.toLowerCase())
    .map(l => l.pair)

  return sumTokens2({ api, tokens: [VIRTUAL], owners: [STAKING, ...pairs] })
}

module.exports = {
  methodology: 'Counts VIRTUAL locked in pre-graduation agent bonding curve pools (FPair) and VIRTUAL locked in the Virtuals Protocol staking contract.',
  base: {
    tvl: () => ({}),
    staking,
  },
}
