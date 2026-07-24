const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

const CTF = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045' // shared Gnosis ConditionalTokens
const NATIVE_USDC = ADDRESSES.polygon.USDC_CIRCLE
const PROPHET_ORACLE = '0x38c0e682c04f9f94cceebd244c37456a1bb01036' // prepares every Prophet condition
const PROPHET_EXCHANGE = '0x127aD3A6e55EbBDaecC0eaeb12615879611e1839' // splits/merges collateral on the CTF
const START_BLOCK = 86367887 // block when Prophet oracle first prepared a condition on the CTF

const CONDITION_PREPARATION = 'event ConditionPreparation(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint256 outcomeSlotCount)'
const POSITION_SPLIT = 'event PositionSplit(address indexed stakeholder, address collateralToken, bytes32 indexed parentCollectionId, bytes32 indexed conditionId, uint256[] partition, uint256 amount)'
const POSITIONS_MERGE = 'event PositionsMerge(address indexed stakeholder, address collateralToken, bytes32 indexed parentCollectionId, bytes32 indexed conditionId, uint256[] partition, uint256 amount)'
const PAYOUT_REDEMPTION = 'event PayoutRedemption(address indexed redeemer, address indexed collateralToken, bytes32 indexed parentCollectionId, bytes32 conditionId, uint256[] indexSets, uint256 payout)'

const pad = (addr) => '0x' + '0'.repeat(24) + addr.slice(2).toLowerCase()
const isNativeUsdc = (token) => token.toLowerCase() === NATIVE_USDC.toLowerCase()

async function tvl(api) {
  // 1. Enumerate Prophet's conditions: every condition its oracle has prepared on the CTF.
  const conditions = await getLogs2({
    api, target: CTF, fromBlock: START_BLOCK, extraKey: 'conditions', eventAbi: CONDITION_PREPARATION, 
    topics: ['0xab3760c3bd2bb38b5bcf54dc79802ed67338b4cf29f3054ded67ed24661e4177', null, pad(PROPHET_ORACLE)],
  })
  const prophetConditions = new Set(conditions.map(c => c.conditionId.toLowerCase()))

  // 2. Collateral Prophet minted into the CTF (splits) and unwound before resolution (merges),
  //    both routed through Prophet's exchange as the CTF stakeholder.
  const splits = await getLogs2({
    api, target: CTF, fromBlock: START_BLOCK, extraKey: 'splits', eventAbi: POSITION_SPLIT,
    topics: ['0x2e6bb91f8cbcda0c93623c54d0403a43514fabc40084ec96b6d5379a74786298', pad(PROPHET_EXCHANGE)],
  })
  const merges = await getLogs2({
    api, target: CTF, fromBlock: START_BLOCK, extraKey: 'merges', eventAbi: POSITIONS_MERGE,
    topics: ['0x6f13ca62553fcc2bcd2372180a43949c1e4cebba603901ede2f4e14f36b282ca', pad(PROPHET_EXCHANGE)],
  })

  // 3. Collateral withdrawn when Prophet markets resolve. Redemptions can be called by anyone
  //    (winners, the house safe...), so we match them to Prophet by conditionId, not by caller.
  const redemptions = await getLogs2({
    api, target: CTF, fromBlock: START_BLOCK, extraKey: 'redemptions', eventAbi: PAYOUT_REDEMPTION,
    topics: ['0x2682012a4a4f1973119f1c9b90745d1bd91fa2bab387344f044cb3586864d18d', null, pad(NATIVE_USDC)],
  })

  // locked = minted - unwound - redeemed (native USDC only)
  let locked = 0n
  splits.forEach(e => { if (isNativeUsdc(e.collateralToken)) locked += BigInt(e.amount) })
  merges.forEach(e => { if (isNativeUsdc(e.collateralToken)) locked -= BigInt(e.amount) })
  redemptions.forEach(e => { if (prophetConditions.has(e.conditionId.toLowerCase())) locked -= BigInt(e.payout) })
  if (locked < 0n) locked = 0n

  api.add(NATIVE_USDC, locked.toString())

  // 4. Plus native USDC sitting directly in Prophet's own contracts.
  await api.sumTokens({ owners: [PROPHET_EXCHANGE], tokens: [NATIVE_USDC] })
}

module.exports = {
  methodology:
    'TVL is the native USDC collateral backing Prophet Market positions on Polygon. Prophet uses the shared ' +
    'Gnosis ConditionalTokens contract, so we attribute only collateral for conditions prepared by Prophet\'s oracle: ' +
    'USDC split into outcome tokens through Prophet\'s exchange, minus positions merged back and winnings redeemed at ' +
    'resolution, plus native USDC held directly in Prophet\'s exchange. This excludes the collateral of ' +
    'Polymarket and other protocols that share the same ConditionalTokens contract.',
  start: '2026-05-04',
  polygon: { tvl },
}
