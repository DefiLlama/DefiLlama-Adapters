const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const VIRTUAL = '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b'
const FFACTORY = '0x8909dc15e40173ff4699343b6eb8132c65e18ec6'
const STAKING = '0x60a203ddcde45fbfb325bdeea93824b5726b4df8'

const PAIR_CREATED = 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256 pairId)'

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FFACTORY,
    fromBlock: 17130330,
    eventAbi: PAIR_CREATED,
  })

  const pairs = logs
    .filter(l => l.token0.toLowerCase() === VIRTUAL.toLowerCase() || l.token1.toLowerCase() === VIRTUAL.toLowerCase())
    .map(l => l.pair)

  return sumTokens2({ api, tokens: [VIRTUAL], owners: pairs })
}

async function staking(api) {
  return sumTokens2({ api, tokens: [VIRTUAL], owners: [STAKING] })
}

module.exports = {
  methodology: 'TVL counts VIRTUAL locked in pre-graduation agent bonding curve pools (FPair). Staking counts VIRTUAL locked in the Virtuals Protocol staking contract.',
  base: {
    tvl,
    staking,
  },
}
