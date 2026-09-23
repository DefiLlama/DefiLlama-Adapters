const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0xd6b86b9B1bB64b941b21AaA6a0e3A673e8405A3b'
const FEE_SPLITTER = '0xd6b05564cea990b69abf10b433279093758e2a54'
const POSITION_MANAGER = '0x6049c9a0e26405C0985f9E3685C87d0aE917f82B' // Uniswap V4 PositionManager on Arc
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b' // Uniswap V4 StateView on Arc
const USDC = '0x0000000000000000000000000000000000000000' // native USDC (gas token, 18 decimals)
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const SOLON_STAKING = '0xB3E0b89b3Ba098D83072dd60c1946CFB3231688f'
const SOLON_USDC_POOL = '0xe4c4b7da3706193e7bf6e7b236156718a5856bc6d6866440661969ae3dcb0a77' // Uniswap V4 USDC/SOLON 1%, no hook

async function tvl(api) {
  // 1. Quote asset held by live (non-graduated) bonding curves, read as balances.
  const launches = await getLogs2({
    api, target: FACTORY, fromBlock: 21134269,
    eventAbi: 'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)',
  })
  const graduated = await api.multiCall({ abi: 'bool:graduated', calls: launches.map(i => i.curve) })
  const tokensAndOwners = launches.filter((_, i) => !graduated[i]).map(i => [i.pairToken, i.curve])
  await sumTokens2({ api, tokensAndOwners })

  // 2. USDC side of the permanently locked Uniswap V4 launch positions held by the FeeSplitter.
  // The V4 PositionManager has no enumeration, so token ids come from Transfer logs and are re-verified with ownerOf.
  const transfers = await getLogs2({
    api, target: POSITION_MANAGER, fromBlock: 21153856,
    eventAbi: 'event Transfer(address indexed from, address indexed to, uint256 indexed id)',
    topics: [TRANSFER_TOPIC, null, '0x' + FEE_SPLITTER.slice(2).padStart(64, '0')],
  })
  const ids = [...new Set(transfers.map(i => i.id.toString()))]
  const owners = await api.multiCall({ target: POSITION_MANAGER, abi: 'function ownerOf(uint256) view returns (address)', calls: ids, permitFailure: true })
  const positionIds = ids.filter((_, i) => owners[i]?.toLowerCase() === FEE_SPLITTER)
  if (!positionIds.length) return

  return sumTokens2({
    api, resolveUniV4: true,
    uniV4ExtraConfig: { positionIds, nftAddress: POSITION_MANAGER, stateViewer: STATE_VIEW, whitelistedTokens: [USDC] },
  })
}

async function staking(api) {
  // Staked principal only. The contract also holds the SOLON reward reserve (buyback + genesis
  // streams), which is protocol-funded and not counted.
  const staked = BigInt(await api.call({ target: SOLON_STAKING, abi: 'uint256:totalStaked' }))
  if (staked === 0n) return
  // SOLON has no coins-server price on Arc: value it at the spot price of its main pool.
  // currency0 is native USDC and currency1 is SOLON (both 18 decimals), so USDC = SOLON * Q96^2 / sqrtPriceX96^2.
  const { sqrtPriceX96 } = await api.call({ target: STATE_VIEW, params: [SOLON_USDC_POOL], abi: 'function getSlot0(bytes32) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)' })
  const sqrtPrice = BigInt(sqrtPriceX96)
  api.add(USDC, (staked * (1n << 192n) / (sqrtPrice * sqrtPrice)).toString())
}

module.exports = {
  methodology: 'TVL is the quote asset (native USDC) held by non-graduated bonding curves plus the USDC side of the permanently locked Uniswap V4 launch positions held by the FeeSplitter, enumerated from PositionManager Transfer events and re-verified with ownerOf. Launched tokens and uncollected trading fees are excluded. Marked doublecounted because the locked positions already sit inside Uniswap V4 TVL on Arc. Staking is the SOLON principal staked in SolonStaking (totalStaked, excluding the reward reserve), valued at the spot price of the USDC/SOLON Uniswap V4 pool.',
  doublecounted: true,
  arc: { tvl, staking },
}
