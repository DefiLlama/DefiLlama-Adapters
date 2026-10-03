const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const POSITION_MANAGER = '0x6049c9a0e26405C0985f9E3685C87d0aE917f82B' // Uniswap V4 PositionManager on Arc
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b' // Uniswap V4 StateView on Arc
const USDC = ADDRESSES.null // native USDC (gas token, 18 decimals)
const SOLON = '0xd36687146385F7Dc84A18FEA3D00319d39D6d1a0'
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

// V2: Pons bonding curves + launch positions locked in the FeeSplitter
const FACTORY = '0xd6b86b9B1bB64b941b21AaA6a0e3A673e8405A3b'
const FEE_SPLITTER = '0xd6b05564cea990b69abf10b433279093758e2a54'

// V3
const V3_DEPLOY_BLOCK = 23985516
const V3_LP_LOCKER = '0x09650Be5c4866971aBbD5C9e92AE495A118fD13F'
const POOL_A_VAULT = '0x3A8fEC5ca16aD845d7f9f6002d8Ff4a64F73d3E2' // StockPoolVault: USDC / NVDA.sol pool A
const PROTOCOL_HOLDERS = [ // fees, rewards and float collected but not yet spent or paid out
  '0x9E8D7502A702d195631937aCb69bf30FfAd3786c', // SolonStockHub
  POOL_A_VAULT,
  '0xA92ae21934504a8c10d917981498Ce71956CD7D9', // DeskRewards
  '0xec2e2F30D30Cb658860158916FF3a922Ee97A051', // ProtocolDeskVault
  '0xF14A184b93a47DE64d0F747C6cCe5d38eB67082D', // ProtocolVault
  '0x0A0a192DB331a3bc5Da4dCF62f91214229e26477', // OpsVault
  '0x70AB3b995AFd0313CaA1F35D70a64a6bc8906915', // CanonicalGate
  '0x70bb736eCBfBACf6bdDfbfeDd7E36D3Dac59e088', // V3FeeLedger
  '0x8F5abE9f9616b3cC4e86d86548E5063b97Bf982c', // BuybackVault
  '0xfE3f4bE4B1f6869721AB68cB3e0eaE160225Db09', // BuybackBurnExecutor
  '0x53ef255aF936C28a6f6EAdE7Bfb3aB3a6eCd58dD', // RewardPayoutVault
  '0x38A42d8432FD8df79c26650D6C2B25adA1149f61', // RewardVault
  '0x9B68469BBaceD6dC92F5Bb3cfe25e1097d193C9A', // RewardDistributor
  '0x985cdEE43c500B64b4A749262D26E440AF6Ab748', // RewardBatcher
  '0xdf5Ee72DF3e5b4Fb5fA56391BEf23331eeF65d1e', // StockFeeConverter
  '0x92FCDd59420964BcdC0FD99067e4e604fc46e198', // V2FeeConverter
  '0x332cc2E07A80c57601617CD65dFe1CffF97c6551', // V2FeeIngress
  '0xd20A87639B5a3e86a815627e468072C3a3276172', // SolonStakingV2 (USDC / stock rewards only; staked SOLON is in `staking`)
]

// Arc stock tokens are minted 1:1 against the same share held in the Robinhood Chain reserve; priced as that share
const STOCKS = {
  '0x2312290792Cf429605D09A42Fa43dAB810486c18': '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA.sol -> NVDA
  '0x785415d2994222533E3A0ECa9FE95Cc41623d9cf': '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', // AAPL.sol -> AAPL
  '0xAF91A1f046d7ab339b7FF71C0f4D9c166eB1f308': '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', // TSLA.sol -> TSLA
}
const QUOTES = [USDC, ...Object.keys(STOCKS)]

const SOLON_STAKING = [
  '0xd20A87639B5a3e86a815627e468072C3a3276172', // SolonStakingV2
  '0xB3E0b89b3Ba098D83072dd60c1946CFB3231688f', // original SOLON staking pool
]

const positionInfoAbi = 'function getPoolAndPositionInfo(uint256) view returns ((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, uint256 info)'

// The V4 PositionManager has no enumeration, so token ids come from Transfer logs and are re-verified with ownerOf
async function positionsOf(api, owner, fromBlock, extraKey) {
  const transfers = await getLogs2({
    api, target: POSITION_MANAGER, fromBlock, extraKey,
    eventAbi: 'event Transfer(address indexed from, address indexed to, uint256 indexed id)',
    topics: [TRANSFER_TOPIC, null, '0x' + owner.slice(2).toLowerCase().padStart(64, '0')],
  })
  const ids = [...new Set(transfers.map(i => i.id.toString()))]
  const owners = await api.multiCall({ target: POSITION_MANAGER, abi: 'function ownerOf(uint256) view returns (address)', calls: ids, permitFailure: true })
  return ids.filter((_, i) => owners[i]?.toLowerCase() === owner.toLowerCase())
}

const isSolonPool = ({ currency0, currency1 }) => [currency0, currency1].some(i => i.toLowerCase() === SOLON.toLowerCase())

async function splitSolonPool(api, ids) {
  if (!ids.length) return { solon: [], others: [] }
  const infos = await api.multiCall({ target: POSITION_MANAGER, abi: positionInfoAbi, calls: ids })
  return {
    solon: ids.filter((_, i) => isSolonPool(infos[i].poolKey)),
    others: ids.filter((_, i) => !isSolonPool(infos[i].poolKey)),
  }
}

function addV4Positions(api, positionIds, whitelistedTokens) {
  if (!positionIds.length) return
  return sumTokens2({
    api, resolveUniV4: true,
    uniV4ExtraConfig: { positionIds, nftAddress: POSITION_MANAGER, stateViewer: STATE_VIEW, whitelistedTokens },
  })
}

function priceStockTokens(api) {
  const balances = api.getBalances()
  for (const [token, underlying] of Object.entries(STOCKS)) {
    const key = Object.keys(balances).find(k => k.toLowerCase() === `arc:${token.toLowerCase()}`)
    if (!key) continue
    const amount = balances[key]
    api.removeTokenBalance(token)
    api.add(`robinhood:${underlying}`, amount, { skipChain: true })
  }
}

async function tvl(api) {
  // V2 1. Quote asset held by live (non-graduated) bonding curves
  const launches = await getLogs2({
    api, target: FACTORY, fromBlock: 21134269,
    eventAbi: 'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)',
  })
  const graduated = await api.multiCall({ abi: 'bool:graduated', calls: launches.map(i => i.curve) })
  const tokensAndOwners = launches.filter((_, i) => !graduated[i]).map(i => [i.pairToken, i.curve])
  await sumTokens2({ api, tokensAndOwners })

  // V2 2. USDC side of the locked launch positions held by the FeeSplitter (the SOLON/USDC pool is reported as pool2)
  const { others: v2Positions } = await splitSolonPool(api, await positionsOf(api, FEE_SPLITTER, 21153856))
  await addV4Positions(api, v2Positions, [USDC])

  // V3 1. Quote side (USDC or stock token) of the launch positions permanently locked in the V3LPLocker
  const { others: v3Positions } = await splitSolonPool(api, await positionsOf(api, V3_LP_LOCKER, V3_DEPLOY_BLOCK, 'solonpad-v3-locker'))
  await addV4Positions(api, v3Positions, QUOTES)

  // V3 2. Pool A (USDC / NVDA.sol), liquidity added by the StockPoolVault directly in the PoolManager
  const [liquidity, tickLower, tickUpper, tick, poolKey] = await Promise.all([
    api.call({ target: POOL_A_VAULT, abi: 'uint128:liquidity' }),
    api.call({ target: POOL_A_VAULT, abi: 'int24:tickLower' }),
    api.call({ target: POOL_A_VAULT, abi: 'int24:tickUpper' }),
    api.call({ target: POOL_A_VAULT, abi: 'int24:currentTick' }),
    api.call({ target: POOL_A_VAULT, abi: 'function poolKey() view returns ((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks))' }),
  ])
  if (+liquidity > 0) {
    const sa = Math.sqrt(1.0001 ** +tickLower), sb = Math.sqrt(1.0001 ** +tickUpper), sp = Math.min(Math.max(Math.sqrt(1.0001 ** +tick), sa), sb)
    api.add(poolKey.currency0, +liquidity * (sb - sp) / (sp * sb))
    api.add(poolKey.currency1, +liquidity * (sp - sa))
  }

  // V3 3. USDC and stock tokens held by the protocol contracts (incl. pool A's idle balance)
  await sumTokens2({ api, owners: PROTOCOL_HOLDERS, tokens: QUOTES })

  priceStockTokens(api)
  return api.getBalances()
}

async function staking(api) {
  const staked = await api.multiCall({ abi: 'uint256:totalStaked', calls: SOLON_STAKING })
  staked.forEach(i => api.add(SOLON, i))
}

async function pool2(api) {
  const { solon } = await splitSolonPool(api, await positionsOf(api, FEE_SPLITTER, 21153856))
  await addV4Positions(api, solon, [])
}

module.exports = {
  methodology: 'TVL counts only real assets, never the launched tokens themselves. V2: native USDC held by non-graduated bonding curves plus the USDC side of the launch positions permanently locked in the FeeSplitter. V3: the quote side (USDC or a stock token) of the launch positions permanently locked in the V3LPLocker, the pool A (USDC / NVDA.sol) position of the StockPoolVault, and the USDC and stock tokens held by the protocol contracts (fees, rewards and float collected but not yet spent or paid out). V4 positions are enumerated from PositionManager Transfer events and re-verified with ownerOf. Arc stock tokens (NVDA.sol, AAPL.sol, TSLA.sol) are 1:1 backed by the share held on Robinhood Chain and priced as that share; the Robinhood Chain reserve itself is not counted again. Staking: SOLON staked in SolonStakingV2 and the original SOLON staking pool (principal only, undistributed rewards excluded). Pool2: both sides of the protocol-owned, permanently locked SOLON/USDC pool. Burned SOLON is not counted.',
  doublecounted: true, // the locked launch and pool A positions also sit inside Uniswap V4 TVL on Arc
  arc: { tvl, staking, pool2 },
}
