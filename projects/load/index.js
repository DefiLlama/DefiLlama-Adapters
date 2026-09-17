const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

// Arc mainnet (5042) — Load V3 + V4
const USDC = ADDRESSES.arc.USDC
const CURVE_FACTORY = '0x0A9A5B3819a7fB47a9b20b83d10f37E1BA044799'
const BONDING_V4_FACTORY = '0xE9b706f133A5A865FDC8Fa282342a55bA108b1Ff'
const INSTANT_V4_FACTORY = '0x40F0DD19C605f39D9261745d8311c9eB4390AF8c'
const LP_FEE_VAULT = '0x774F264e5Cd83f894C8186bDccCD6aBB5e619F2B'
const INSTANT_V3_VAULT = '0x791A2043F40D72cE3044650F2Cd78EC05735C372'
const V4_LP_FEE_VAULT = '0xb6dc8dF80C13B7DD59954DdD666260bB0A197EA3'
const NFT_MANAGER = '0x39654A85A4C05127f5Fd6ED22CAeC077A0fB1377'
const V4_POSITION_MANAGER = '0x6049c9a0e26405C0985f9E3685C87d0aE917f82B'
const V4_STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'
const FROM_BLOCK = 21_184_244 // Instant V3 factory; V4 factories are later in the same window

const TokenCreated =
  'event TokenCreated(address indexed token, address indexed curve, address indexed creator, string name, string symbol, bytes32 metadataHash, string metadataUri, address pool, uint8 graduationCap, uint16 postGradCreatorShareBps)'

const ZERO = '0x0000000000000000000000000000000000000000'

function nonzero(addr) {
  return addr && addr.toLowerCase() !== ZERO
}

async function factoryLogs(api, target) {
  return getLogs2({
    api,
    target,
    fromBlock: FROM_BLOCK,
    eventAbi: TokenCreated,
  })
}

async function tvl(api) {
  const [v3CurveLogs, v4CurveLogs, instantV4Logs] = await Promise.all([
    factoryLogs(api, CURVE_FACTORY),
    factoryLogs(api, BONDING_V4_FACTORY),
    factoryLogs(api, INSTANT_V4_FACTORY),
  ])

  const curves = [...v3CurveLogs, ...v4CurveLogs]
    .map((i) => i.curve)
    .filter(nonzero)

  if (curves.length) {
    await api.sumTokens({ owners: curves, tokens: [USDC] })
  }

  // V3 vault NFTs + idle USDC on V3/V4 vaults (tax inventory).
  await sumTokens2({
    api,
    owners: [LP_FEE_VAULT, INSTANT_V3_VAULT, V4_LP_FEE_VAULT],
    tokens: [USDC],
    resolveUniV3: true,
    uniV3WhitelistedTokens: [USDC],
    uniV3ExtraConfig: { nftAddress: NFT_MANAGER },
  })

  const v4Tokens = [...v4CurveLogs, ...instantV4Logs].map((i) => i.token).filter(nonzero)
  if (!v4Tokens.length) return

  const positionIds = (await api.multiCall({
    abi: 'function positionTokenIdOf(address) view returns (uint256)',
    target: V4_LP_FEE_VAULT,
    calls: v4Tokens,
  }))
    .map((id) => (id == null ? '0' : id.toString()))
    .filter((id) => id !== '0')

  if (!positionIds.length) return

  // Instant / graduated V4 LP NFTs are locked in the V4 vault (USDC side only).
  return sumTokens2({
    api,
    resolveUniV4: true,
    uniV3WhitelistedTokens: [USDC],
    uniV4ExtraConfig: {
      nftAddress: V4_POSITION_MANAGER,
      stateViewer: V4_STATE_VIEW,
      positionIds,
    },
  })
}

module.exports = {
  methodology:
    'Load TVL is USDC locked in active V3 and V4 bonding curves plus USDC in locked Uniswap V3 and V4 LP positions held by the Load LP fee vaults on Arc. Launch tokens are not counted.',
  doublecounted: true, // locked LP may also appear under Uniswap when that pool TVL is tracked
  arc: {
    tvl,
    start: '2026-09-16',
  },
}
