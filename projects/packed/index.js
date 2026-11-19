const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

// Packed (packd.cc) is a coin launchpad. On Robinhood Chain a coin trades on Packed's own bonding
// curve, one PackedCurve contract per coin, which holds the quote asset buyers pay in (native ETH,
// USDG or a tokenised stock). When the curve has raised its graduation threshold it moves the
// whole reserve into a Uniswap V4 pool and stops trading.
//
// TVL is the quote asset held by every curve that has not graduated. Graduated coins are left out:
// their liquidity is in the Uniswap V4 PoolManager and is already counted by the uniswap listing.
// For the same reason Packed's Ethereum coins, which launch straight into a Uniswap V4 pool with
// no curve, add nothing here.
//
// Every factory that has launched coins for the public is listed; the older ones stay because
// their coins still trade. `fromBlock` is at or before each factory's first launch.
// https://robinhoodchain.blockscout.com/address/0x3Ff274CF9A4B4a3ec6c524C8915B3ad2eD336ade
const FACTORIES = [
  { factory: '0x3Ff274CF9A4B4a3ec6c524C8915B3ad2eD336ade', fromBlock: 64583102 }, // current
  { factory: '0xA5fB8E98aedb2ab59a61971a6956399dF8059511', fromBlock: 64684356 }, // current, taxed pools
  { factory: '0x87C82A09d280B23537Bdc9e4674ce6102B865514', fromBlock: 71700095 }, // current, reward coins
  { factory: '0x0fb1Ea54e75C0DE09978a71976Ac4e6EB0638D69', fromBlock: 70677000 }, // reward coins, first version
  { factory: '0x25a6163aDc23018BfAe0F14177fF3a868d0ADc93', fromBlock: 60944620 },
  { factory: '0x723E5f3Db8336CeD81c615711e79527EA69f1b8F', fromBlock: 56819626 },
  { factory: '0x831403902451C1349C3d041636836A8a49cd39cb', fromBlock: 55948224 },
  { factory: '0x465f4190bAF203591c9D355778400e482dd467C0', fromBlock: 55144222 },
  { factory: '0x86A37F0ADeA97F5F2dB030b78fc28cc28b63e452', fromBlock: 54702378 },
  // The first set predates quoteToken(); its curves only ever traded against native ETH.
  { factory: '0x7b71Fd14b89b7F0aaeE9697723c2641A1E0c932b', fromBlock: 54350011, ethOnly: true },
]

const LAUNCHED = 'event Launched(address indexed token, address indexed curve, address indexed creator, string name, string symbol, uint256 creatorTaxBps)'

/**
 * TVL of Packed on Robinhood Chain: the quote asset held by every bonding curve that has not
 * graduated yet.
 *
 * Curves are listed from the Launched events of every Packed factory. The quote asset of each
 * curve is read from `quoteToken()`, except for the first factory's curves, which predate it and
 * only ever held native ETH. Graduated curves are skipped, since their reserve now sits in a
 * Uniswap V4 pool.
 *
 * @param {object} api - DefiLlama SDK ChainApi for the chain and block being measured.
 * @returns {Promise<object|undefined>} The balances summed by `api.sumTokens`, or nothing when no
 *   curve has been launched yet.
 */
async function tvl(api) {
  const curves = []
  const ethOnly = []
  for (const { factory, fromBlock, ethOnly: onlyEth } of FACTORIES) {
    const logs = await getLogs2({ api, target: factory, eventAbi: LAUNCHED, fromBlock, extraKey: factory })
    for (const l of logs) (onlyEth ? ethOnly : curves).push(l.curve)
  }
  const all = [...curves, ...ethOnly]
  if (!all.length) return

  const [quotes, graduated] = await Promise.all([
    api.multiCall({ abi: 'address:quoteToken', calls: curves }),
    api.multiCall({ abi: 'bool:graduated', calls: all }),
  ])
  const quoteOf = [...quotes, ...ethOnly.map(() => ADDRESSES.null)]

  const ownerTokens = []
  all.forEach((curve, i) => {
    if (!graduated[i]) ownerTokens.push([[quoteOf[i]], curve])
  })
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology:
    'TVL is the quote asset (native ETH, USDG or a tokenised stock) held by every Packed bonding curve on Robinhood Chain that has not graduated. Curves are listed from the Launched events of every Packed factory and read on chain. A graduated coin\'s reserve has moved into a Uniswap V4 pool, which the uniswap listing already counts, so it is left out; Packed coins on Ethereum launch straight into Uniswap V4 pools and are left out for the same reason.',
  start: '2026-09-04',
  robinhood: { tvl },
}
