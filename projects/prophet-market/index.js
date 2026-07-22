const ethers = require('ethers')
const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

// Prophet Market — a prediction-market exchange on Polygon that uses the canonical
// Gnosis ConditionalTokens (CTF) contract as its collateral escrow, sharing that
// contract with Polymarket and several other protocols. Because the CTF commingles
// every protocol's collateral, we cannot use its raw USDC balance as Prophet TVL.
// Instead we attribute only the collateral backing Prophet's own markets, identified
// by the conditions its oracle prepares, and net out redemptions at resolution.

const CTF = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045' // shared Gnosis ConditionalTokens
const NATIVE_USDC = ADDRESSES.polygon.USDC_CIRCLE          // Prophet collateralizes with native Circle USDC (0x3c49...)
const PROPHET_ORACLE = '0x38c0e682c04f9f94cceebd244c37456a1bb01036' // prepares every Prophet condition
const PROPHET_EXCHANGE = '0x127aD3A6e55EbBDaecC0eaeb12615879611e1839' // splits/merges collateral on the CTF
const HOUSE_SAFE = '0xBA8065151BC3191d0A032ca9499AA54E97899E8E'       // holds additional user/market collateral
const START_BLOCK = 86000000 // before Prophet's first condition on Polygon mainnet
const START_TS = 1777120044 // 2026-04-25, timestamp of START_BLOCK (protocol launched shortly after)

const CONDITION_PREPARATION = 'event ConditionPreparation(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint256 outcomeSlotCount)'
const POSITION_SPLIT = 'event PositionSplit(address indexed stakeholder, address collateralToken, bytes32 indexed parentCollectionId, bytes32 indexed conditionId, uint256[] partition, uint256 amount)'
const POSITIONS_MERGE = 'event PositionsMerge(address indexed stakeholder, address collateralToken, bytes32 indexed parentCollectionId, bytes32 indexed conditionId, uint256[] partition, uint256 amount)'
const PAYOUT_REDEMPTION = 'event PayoutRedemption(address indexed redeemer, address indexed collateralToken, bytes32 indexed parentCollectionId, bytes32 conditionId, uint256[] indexSets, uint256 payout)'

const eventTopic = (abi) => new ethers.Interface([abi]).getEvent(abi.slice('event '.length, abi.indexOf('('))).topicHash
const pad = (addr) => '0x' + '0'.repeat(24) + addr.slice(2).toLowerCase()
const isNativeUsdc = (token) => token.toLowerCase() === NATIVE_USDC.toLowerCase()

async function tvl(api) {
  // 1. Enumerate Prophet's conditions: every condition its oracle has prepared on the CTF.
  const conditions = await getLogs2({
    api, target: CTF, fromBlock: START_BLOCK, extraKey: 'conditions',
    eventAbi: CONDITION_PREPARATION, onlyArgs: true,
    topics: [eventTopic(CONDITION_PREPARATION), null, pad(PROPHET_ORACLE)],
  })
  const prophetConditions = new Set(conditions.map(c => c.conditionId.toLowerCase()))

  // 2. Collateral Prophet minted into the CTF (splits) and unwound before resolution (merges),
  //    both routed through Prophet's exchange as the CTF stakeholder.
  const splits = await getLogs2({
    api, target: CTF, fromBlock: START_BLOCK, extraKey: 'splits',
    eventAbi: POSITION_SPLIT, onlyArgs: true,
    topics: [eventTopic(POSITION_SPLIT), pad(PROPHET_EXCHANGE)],
  })
  const merges = await getLogs2({
    api, target: CTF, fromBlock: START_BLOCK, extraKey: 'merges',
    eventAbi: POSITIONS_MERGE, onlyArgs: true,
    topics: [eventTopic(POSITIONS_MERGE), pad(PROPHET_EXCHANGE)],
  })

  // 3. Collateral withdrawn when Prophet markets resolve. Redemptions can be called by anyone
  //    (winners, the house safe...), so we match them to Prophet by conditionId, not by caller.
  const redemptions = await getLogs2({
    api, target: CTF, fromBlock: START_BLOCK, extraKey: 'redemptions',
    eventAbi: PAYOUT_REDEMPTION, onlyArgs: true,
    topics: [eventTopic(PAYOUT_REDEMPTION), null, pad(NATIVE_USDC)],
  })

  // locked = minted - unwound - redeemed (native USDC only)
  let locked = 0n
  splits.forEach(e => { if (isNativeUsdc(e.collateralToken)) locked += BigInt(e.amount) })
  merges.forEach(e => { if (isNativeUsdc(e.collateralToken)) locked -= BigInt(e.amount) })
  redemptions.forEach(e => { if (prophetConditions.has(e.conditionId.toLowerCase())) locked -= BigInt(e.payout) })
  if (locked < 0n) locked = 0n

  api.add(NATIVE_USDC, locked.toString())

  // 4. Plus native USDC sitting directly in Prophet's own contracts.
  await api.sumTokens({ owners: [HOUSE_SAFE, PROPHET_EXCHANGE], tokens: [NATIVE_USDC] })
  return api.getBalances()
}

module.exports = {
  methodology:
    'TVL is the native Circle USDC collateral backing Prophet Market positions on Polygon. Prophet uses the shared ' +
    'Gnosis ConditionalTokens contract, so we attribute only collateral for conditions prepared by Prophet\'s oracle: ' +
    'USDC split into outcome tokens through Prophet\'s exchange, minus positions merged back and winnings redeemed at ' +
    'resolution, plus native USDC held directly in Prophet\'s exchange and house safe. This excludes the collateral of ' +
    'Polymarket and other protocols that share the same ConditionalTokens contract.',
  start: START_TS,
  polygon: { tvl },
}
