const sdk = require('@defillama/sdk')
const { getLogs2 } = require('../helper/cache/getLogs')
const { getConfig } = require('../helper/cache')

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
// The factories come from the protocol's own registry: ProtocolRegistry
// (contracts/ProtocolRegistry.sol in https://github.com/outbidfun/outbidfun-contracts), which the
// team registers every contract in as it deploys it, so a new launchpad needs no change here. It
// is append-only and not upgradeable: an entry is never removed or changed, and each carries the
// block its contract was deployed in, before which it emits nothing. So the registry is read at the
// latest block even for a past day's TVL: a factory registered later has no coins before then.
// Today it lists two factories, both live: the first (27 September 2026), whose coins keep trading
// on their curves, and the one on the constant-product curve that replaced it for new launches on
// 28 September 2026.
// https://robinhoodchain.blockscout.com/address/0xe474680846735dab1c5E2EA1C56b2B12c64aaC1f
const REGISTRY = '0xe474680846735dab1c5E2EA1C56b2B12c64aaC1f'
// `entries(bytes32 kind) returns ((address target, uint64 fromBlock)[])`, as a JSON ABI: the SDK
// does not parse a tuple array from a human-readable one.
const ENTRIES = {
  type: 'function',
  name: 'entries',
  stateMutability: 'view',
  inputs: [{ name: 'kind', type: 'bytes32' }],
  outputs: [{ name: '', type: 'tuple[]', components: [{ name: 'target', type: 'address' }, { name: 'fromBlock', type: 'uint64' }] }],
}
// The kind factories are registered as: 'CoinFactory', its ASCII as a bytes32.
const COIN_FACTORY = '0x' + Buffer.from('CoinFactory', 'ascii').toString('hex').padEnd(64, '0')
const MEMECOIN_DEPLOYED = 'event MemeCoinDeployed(address indexed creator, address indexed memecoin, address indexed quoteAsset)'

/** Every CoinFactory the protocol has had, each with the block it was deployed in. */
async function factories(chain) {
  const list = await getConfig(`outbidfun/registry/${chain}`, undefined, {
    fetcher: async () => {
      const entries = await new sdk.ChainApi({ chain }).call({ target: REGISTRY, abi: ENTRIES, params: [COIN_FACTORY] })
      if (!entries.length) throw new Error('outbidfun: the registry lists no CoinFactory')
      return entries.map((entry) => ({ target: entry.target, fromBlock: Number(entry.fromBlock) }))
    },
  })
  // getConfig answers a failed read with the last list it cached, or with {} where there is none.
  if (!Array.isArray(list) || !list.length) throw new Error('outbidfun: could not read the CoinFactories from the registry')
  return list
}

/**
 * Sums the reserve asset held by every coin whose bonding curve is still live (`cap()` > 0).
 * @param {import('@defillama/sdk').ChainApi} api
 */
async function tvl(api) {
  const logs = (await Promise.all(
    (await factories(api.chain)).map(({ target, fromBlock }) => getLogs2({ api, target, fromBlock, eventAbi: MEMECOIN_DEPLOYED }))
  )).flat()
  const caps = await api.multiCall({ abi: 'uint96:cap', calls: logs.map((log) => log.memecoin) })
  const tokensAndOwners = logs
    .filter((_, i) => BigInt(caps[i]) > 0n)
    .map((log) => [log.quoteAsset, log.memecoin])
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology: 'Reserve assets (WETH, USDG and other listed assets) held by every outbidfun.lol coin whose bonding curve is still live, found from the MemeCoinDeployed events of every CoinFactory registered in the protocol registry (today the first, and the one on the constant-product curve that replaced it for new launches on 28 September 2026). Graduated coins, whose reserve has moved into a locked Uniswap V3 pool, are excluded, as are the launched coins themselves.',
  start: '2026-09-27',
  robinhood: { tvl },
}
