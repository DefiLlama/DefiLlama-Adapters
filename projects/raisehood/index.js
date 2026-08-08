const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0xde540a7d140e27e50305fae78e736fe00f4a917f'

// V3 position managers RaiseHood seeds locked liquidity on
const NFT_MANAGERS = [
  '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3', // Uniswap V3 NPM (Robinhood Chain)
  '0xd359160448B011dC1AAAF9C166e2e13bb414e6b3', // RobinSwap V3 NPM
]

const saleDataAbi = 'function getSaleData() view returns (tuple(address saleToken, address quoteToken, uint256 tokensPerQuoteUnit, uint256 softCap, uint256 hardCap, uint256 minBuy, uint256 maxBuy, uint64 startsAt, uint64 endsAt, bytes32 merkleRoot, uint16 tgeBps, uint64 cliffDuration, uint64 vestingDuration, address lpAdapter, uint16 lpBps, uint8 state, uint256 totalRaised, uint256 totalTokensSold, uint256 saleAllocation, uint64 finalizedAt, uint64 claimsOpenAt, bool deposited, bool cancelled, bool lpCreated, address projectOwner, uint256 quoteDecimalScale, uint256 platformFeeBps, bool escaped, bool closedEarly, uint8 pricingMode, address priceFeed, uint256 tokenPriceUsd, uint256 totalRaisedUsd, uint64 lpLockDuration, uint256 lpTokensAmount, bool burnUnsold))'
const positionsAbi = 'function positions(uint256) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)'
const ticksAbi = 'function ticks(int24) view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128, int56 tickCumulativeOutside, uint160 secondsPerLiquidityOutsideX128, uint32 secondsOutside, bool initialized)'
const slot0Abi = 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'

const Q128 = 2n ** 128n
const U256 = 2n ** 256n
const subMod = (a, b) => ((a - b) % U256 + U256) % U256

// uncollected fees = checkpointed tokensOwed + liquidity * feeGrowthInside delta since last checkpoint
async function addUncollectedFees(api, npm, owner) {
  const count = await api.call({ abi: 'erc20:balanceOf', target: npm, params: owner })
  if (+count === 0) return
  const ids = await api.multiCall({ abi: 'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)', target: npm, calls: Array.from({ length: +count }, (_, i) => ({ params: [owner, i] })) })
  const positions = await api.multiCall({ abi: positionsAbi, target: npm, calls: ids })
  const factory = await api.call({ abi: 'address:factory', target: npm })
  const pools = await api.multiCall({ abi: 'function getPool(address, address, uint24) view returns (address)', target: factory, calls: positions.map(p => ({ params: [p.token0, p.token1, p.fee] })) })
  const [slot0s, global0s, global1s, lowerTicks, upperTicks] = await Promise.all([
    api.multiCall({ abi: slot0Abi, calls: pools }),
    api.multiCall({ abi: 'uint256:feeGrowthGlobal0X128', calls: pools }),
    api.multiCall({ abi: 'uint256:feeGrowthGlobal1X128', calls: pools }),
    api.multiCall({ abi: ticksAbi, calls: pools.map((pool, i) => ({ target: pool, params: [positions[i].tickLower] })) }),
    api.multiCall({ abi: ticksAbi, calls: pools.map((pool, i) => ({ target: pool, params: [positions[i].tickUpper] })) }),
  ])
  positions.forEach((p, i) => {
    const tick = +slot0s[i].tick
    for (const side of [0, 1]) {
      const global = BigInt(side === 0 ? global0s[i] : global1s[i])
      const outsideLower = BigInt(lowerTicks[i][`feeGrowthOutside${side}X128`])
      const outsideUpper = BigInt(upperTicks[i][`feeGrowthOutside${side}X128`])
      const below = tick >= +p.tickLower ? outsideLower : subMod(global, outsideLower)
      const above = tick < +p.tickUpper ? outsideUpper : subMod(global, outsideUpper)
      const inside = subMod(subMod(global, below), above)
      const delta = subMod(inside, BigInt(p[`feeGrowthInside${side}LastX128`]))
      const owed = BigInt(p[`tokensOwed${side}`]) + BigInt(p.liquidity) * delta / Q128
      api.add(side === 0 ? p.token0 : p.token1, owed.toString())
    }
  })
}

async function tvl(api) {
  const sales = await api.fetchList({ lengthAbi: 'uint256:allSalesLength', itemAbi: 'function allSales(uint256) view returns (address)', target: FACTORY })
  const lpLocker = await api.call({ abi: 'address:lpLocker', target: FACTORY })
  const saleData = await api.multiCall({ abi: saleDataAbi, calls: sales })

  // quote assets (native ETH, USDG, tokenized stocks) escrowed in each sale during the raise
  const ownerTokens = saleData.map((d, i) => [[d.quoteToken], sales[i]])
  // the locker also holds LP trading fees already collected from locked positions (both quote and sale-token side)
  ownerTokens.push([saleData.flatMap(d => [d.quoteToken, d.saleToken]), lpLocker])

  // fees earned by the locked positions but not yet collected to the locker
  for (const npm of NFT_MANAGERS) await addUncollectedFees(api, npm, lpLocker)

  return sumTokens2({
    api,
    ownerTokens,
    uniV3nftsAndOwners: NFT_MANAGERS.map(npm => [npm, lpLocker]),
  })
}

module.exports = {
  methodology: 'TVL counts the quote assets (ETH, USDG, Robinhood tokenized stocks) escrowed in RaiseHood sale contracts during active raises, plus the V3 LP positions (Uniswap V3 / RobinSwap) that are auto-seeded at settlement and time-locked in the RaiseHood LP fee vault, plus accrued LP trading fees.',
  doublecounted: true, // locked LP positions sit in Uniswap V3 / RobinSwap pools, which are tracked separately
  robinhood: { tvl },
}
