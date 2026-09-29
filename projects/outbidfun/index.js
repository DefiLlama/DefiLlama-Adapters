const { getLogs2 } = require('../helper/cache/getLogs')

// outbidfun.lol (outbidfun.lol) — bonding-curve token launchpad on Robinhood Chain (4663).
// Every coin is its own contract and custodies its curve's reserve in the asset its creator
// priced it in: WETH, USDG, or another asset the factory lists. When the reserve reaches the
// coin's cap, the coin graduates: the whole reserve moves into a full-range position in the
// platform's own Uniswap V3 pool, locked forever, and the coin's `cap()` reads zero from then on.
//
// TVL is the reserve held by every live curve. A curve mints coins on demand, so it holds no
// inventory of its own coin to exclude, and fees leave it on every trade. Graduated coins are
// skipped: their reserve is in the pool.
//
// Two factories, both live (https://github.com/outbidfun/outbidfun-contracts/blob/main/DEPLOYMENTS.md):
// the first (27 September 2026), whose coins keep trading on their curves, and the one on the
// constant-product curve that replaced it for new launches on 28 September 2026.
const FACTORIES = [
  { target: '0xDadC43dbf60eA5d4598C39500Ede46De6A14c0d0', fromBlock: 73821560 },
  { target: '0xDD0e33a1d5452275E563020F58fC989f26B74CF6', fromBlock: 74842311 },
]
const MEMECOIN_DEPLOYED = 'event MemeCoinDeployed(address indexed creator, address indexed memecoin, address indexed quoteAsset)'

/**
 * Sums the reserve asset held by every coin whose bonding curve is still live (`cap()` > 0).
 * @param {import('@defillama/sdk').ChainApi} api
 */
async function tvl(api) {
  const logs = (await Promise.all(
    FACTORIES.map(({ target, fromBlock }) => getLogs2({ api, target, fromBlock, eventAbi: MEMECOIN_DEPLOYED }))
  )).flat()
  const caps = await api.multiCall({ abi: 'uint96:cap', calls: logs.map((log) => log.memecoin) })
  const tokensAndOwners = logs
    .filter((_, i) => BigInt(caps[i]) > 0n)
    .map((log) => [log.quoteAsset, log.memecoin])
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology: 'Reserve assets (WETH, USDG and other listed assets) held by every outbidfun.lol coin whose bonding curve is still live, found from the MemeCoinDeployed events of both CoinFactories (the first, and the one on the constant-product curve that replaced it for new launches on 28 September 2026). Graduated coins, whose reserve has moved into a locked Uniswap V3 pool, are excluded, as are the launched coins themselves.',
  start: '2026-09-27',
  robinhood: { tvl },
}
