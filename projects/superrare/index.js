const { getLogs2 } = require('../helper/cache/getLogs')

const RARE = '0xba5BDe662c17e2aDFF1075610382B9B691296350'
const FACTORY = '0x5d09145E1E798c7a885e49a6FC4f0542ce231A47'
const FROM_BLOCK = 18021312 // First StakingContractCreated event.

async function staking(api) {
  if (await api.getBlock() < FROM_BLOCK) return {}

  const owners = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: FROM_BLOCK,
    eventAbi: 'event StakingContractCreated(address indexed _deployingUser, address indexed _userStakedOn, address indexed _stakingAddress)',
    transform: log => log._stakingAddress,
  })

  return api.sumTokens({ owners, tokens: [RARE] })
}

module.exports = {
  methodology: 'Counts RARE held in legacy Rarity Pools as staking, including unclaimed rewards. Excludes sRARE receipts and external reward accumulators.',
  ethereum: {
    staking,
    tvl: async () => ({}),
  },
}
