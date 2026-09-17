const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

// Arc mainnet (5042) — current stack only (packages/contracts/deployments/5042.json)
const USDC = ADDRESSES.arc.USDC
const CURVE_FACTORY = '0x18855447fC2Ee7E1dD4aA644F368462073bE10AD'
const BONDING_V4_FACTORY = '0x3c1c93DAE209A123225d5bCA6C32C9c5a91F10AD'
const INSTANT_V4_FACTORY = '0xc2cf1bBfd1Cba383b615FC9C08E301C17EBD10AD'
const LP_FEE_VAULT = '0xD115355EF00C84085Fe3426B58dFd8014FE910AD'
const INSTANT_V3_VAULT = '0x6F3e480470242500AF413a96037253AFfb6310AD'
const V4_LP_FEE_VAULT = '0xdA1F36Ac79BBa3124Bc5f852930de76F60d910AD'
const NFT_MANAGER = '0x39654A85A4C05127f5Fd6ED22CAeC077A0fB1377'
const V4_POSITION_MANAGER = '0x6049c9a0e26405C0985f9E3685C87d0aE917f82B'
const V4_STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'
const FROM_BLOCK = 21_344_264

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
    start: '2026-09-17',
  },
}
