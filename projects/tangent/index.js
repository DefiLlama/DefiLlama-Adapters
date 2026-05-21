/*
 * Tangent Finance — DefiLlama TVL adapter
 *
 * TVL is the sum of:
 *   1. Collateral held across all Tangent lending markets. Each market exposes
 *      totalCollateral() (in raw collateral-token units) and collatToken() (the
 *      address of the collateral — for the wrapped market types this is the
 *      underlying LP, not the gauge/Convex receipt). DefiLlama prices Curve
 *      LPs natively.
 *
 *   2. The full balance of LP tokens held by USG peg keepers (Curve V2 Peg
 *      Keepers, deployed by Tangent against USG-paired stableswap-NG pools).
 *      DefiLlama unwraps the LP into its underlyings and prices each side.
 *      Note: the USG side will be priced at $1 once the stablecoin listing in
 *      peggedassets-server is live, slightly double-counting protocol-minted
 *      USG sitting inside the peg defense pools — this mirrors how Curve's
 *      crvUSD adapter treats its own peg keepers.
 *
 *   3. sUSG, the USG savings vault, reported under `staking` (mirrors how
 *      Curve's scrvUSD appears on DefiLlama).
 *
 * Markets are discovered dynamically by reading the 5 MarketCreator events,
 * so newly deployed markets get picked up without re-PRing. Peg keepers are
 * hardcoded; switch to enumeration via PegKeeperRegulator once that contract
 * exposes a getter for all keepers.
 */

const { getLogs2 } = require('../helper/cache/getLogs')

// ----- Tangent core contracts on Ethereum mainnet -----
const MARKET_CREATOR = '0x214C8A1023B30032a2Eded109146658C6D6F2781'
const SUSG          = '0xf17d6f98a5c6eaa99d149079984119e0a4ef6900'
const USG           = '0xb1c2db5d6ca03fce73dbd304d320bf76c55ae1b1'

// MarketCreator was deployed at block 24634921 — slight safety margin for logs.
const FROM_BLOCK = 24634900

// All five market-template events share the shape (address proxy, string name).
const MARKET_CREATED_EVENTS = [
  'event MarketCurveGaugeCreated(address proxy, string name)',
  'event MarketConvexCrvCreated(address proxy, string name)',
  'event MarketConvexFxnCreated(address proxy, string name)',
  'event MarketStakeDaoVaultV2Created(address proxy, string name)',
  'event BasicERC20MarketCreated(address proxy, string name)',
]

// Curve V2 Peg Keepers (expose pegged(), pool(), debt()).
const PEG_KEEPERS = [
  '0xf89615f75c8161dc185c03020240905f6b66bad9', // USG-USDC
  '0x8a7f16508d1e8b48bdf36023f378cc04d9506d4e', // USG-frxUSD
]

// ---------- Markets ----------

async function getAllMarkets(api) {
  const logsPerEvent = await Promise.all(
    MARKET_CREATED_EVENTS.map(eventAbi =>
      getLogs2({
        api,
        target: MARKET_CREATOR,
        eventAbi,
        fromBlock: FROM_BLOCK,
        // Each event shares the same target, so disambiguate the on-disk cache key.
        extraKey: eventAbi.match(/event (\w+)/)[1],
      })
    )
  )

  return logsPerEvent.flat().map(log => log.proxy)
}

async function addMarketsTvl(api) {
  const markets = await getAllMarkets(api)
  if (markets.length === 0) return

  const [collatTokens, totalCollaterals] = await Promise.all([
    api.multiCall({ abi: 'address:collatToken', calls: markets }),
    api.multiCall({ abi: 'uint256:totalCollateral', calls: markets }),
  ])
  collatTokens.forEach((token, i) => api.add(token, totalCollaterals[i]))
}

// ---------- Peg keepers ----------

async function addPegKeepersTvl(api) {
  // pool() returns the Curve pool address — for stableswap-NG that's also the LP.
  const pools = await api.multiCall({ abi: 'address:pool', calls: PEG_KEEPERS })

  const lpBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: PEG_KEEPERS.map((pk, i) => ({ target: pools[i], params: pk })),
  })

  pools.forEach((lp, i) => api.add(lp, lpBalances[i]))
}

// ---------- Main TVL ----------

async function tvl(api) {
  await addMarketsTvl(api)
  await addPegKeepersTvl(api)
}

// ---------- sUSG (staking) ----------

async function susgTvl(api) {
  // sUSG is ERC4626-style; totalAssets() returns the USG backing.
  const assets = await api.call({ abi: 'uint256:totalAssets', target: SUSG })
  api.add(USG, assets)
}

module.exports = {
  methodology:
    "TVL = collateral held across Tangent markets (totalCollateral() per market) " +
    "+ LP tokens held by USG peg keepers. sUSG (USG savings vault) reported under Staking.",
  ethereum: {
    tvl,
    staking: susgTvl,
  },
}