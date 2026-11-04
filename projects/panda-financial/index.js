const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs')

const REGISTRY = '0x52643dCDdd95944b01f10A4949d2923a0ff69FCC'
const OLD_VAULT = '0xf5D48b04D4529D652BFAE172E8Fb47b389Db920e' // first vault, predates the registry and is not listed in it

const abi = {
  vaults: 'address[]:vaults',
  pool: 'address:pool',
  gauge: 'address:gauge',
  positionManager: 'address:positionManager',
  stakedValues: 'function stakedValues(address depositor) view returns (uint256[])',
  token0: 'address:token0',
  token1: 'address:token1',
  slot0: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, bool unlocked)',
  positions: 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
}

// Each deposit is its own position NFT, staked in the pool's gauge, so the gauge lists each vault's open positions.
// NFTs the vaults hold directly are closed positions with no liquidity.
async function tvl(api) {
  const registered = await api.call({ target: REGISTRY, abi: abi.vaults, permitFailure: true }) // not deployed until October 2026
  const vaults = [OLD_VAULT, ...(registered ?? [])]
  const pools = await api.multiCall({ abi: abi.pool, calls: vaults })
  const gauges = await api.multiCall({ abi: abi.gauge, calls: vaults })
  const managers = await api.multiCall({ abi: abi.positionManager, calls: vaults })
  const token0s = await api.multiCall({ abi: abi.token0, calls: pools })
  const token1s = await api.multiCall({ abi: abi.token1, calls: pools })
  const slot0s = await api.multiCall({ abi: abi.slot0, calls: pools })

  const tokensAndOwners = []
  for (let i = 0; i < vaults.length; i++) {
    const ids = await api.call({ target: gauges[i], abi: abi.stakedValues, params: [vaults[i]] })
    const positions = await api.multiCall({ target: managers[i], abi: abi.positions, calls: ids })

    positions.forEach(({ tickLower, tickUpper, liquidity, tokensOwed0, tokensOwed1 }) => {
      addUniV3LikePosition({ api, token0: token0s[i], token1: token1s[i], liquidity: +liquidity, tickLower: +tickLower, tickUpper: +tickUpper, tick: +slot0s[i].tick })
      api.add(token0s[i], tokensOwed0)
      api.add(token1s[i], tokensOwed1)
    })
    tokensAndOwners.push([token0s[i], vaults[i]], [token1s[i], vaults[i]])
  }
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  doublecounted: true, // positions sit in Aero concentrated-liquidity pools, already counted in Aero's TVL (projects/aero-lite)
  methodology:
    "Counts the WETH and USDC in every open position of Panda's old vault and of each vault in its on-chain registry at the current pool price, plus tokens owed to those positions and idle WETH and USDC held by the vaults. AERO rewards waiting to be claimed are not counted.",
  start: '2026-09-12',
  base: { tvl },
}
