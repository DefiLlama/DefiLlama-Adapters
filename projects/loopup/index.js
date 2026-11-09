const { getLogs2 } = require('../helper/cache/getLogs')

// LoopUP (https://loopup.fun) is a Pons V2 based launchpad on Robinhood Chain with two launch sets,
// each with its own LoopV2LaunchFactory. Deploy blocks are from the deployment broadcast receipts.
const FACTORIES = [
  { factory: '0xd8146E5Dd21a67E2fe45752de44B95fD09609A8d', fromBlock: 107579725 }, // platform set (all public launches)
  { factory: '0x5e0Af0cf7a20e797ef0C65b8aBE5423E5Db7356c', fromBlock: 107581085 }, // LOOP set (launched the $LOOP token)
]

const TokenLaunched = 'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)'

async function tvl(api) {
  const launches = (await Promise.all(FACTORIES.map(({ factory, fromBlock }) =>
    getLogs2({ api, target: factory, eventAbi: TokenLaunched, fromBlock, extraKey: 'launched' })
  ))).flat()
  if (!launches.length) return

  // realQuoteReserve() is the quote asset backing the curve, excluding fees and creator tax waiting
  // to be swept. It is 0 once a coin graduates: its reserve then sits in a Uniswap V4 pool that is
  // already counted under Uniswap V4, so graduated coins drop out here without double counting.
  const reserves = await api.multiCall({ abi: 'uint256:realQuoteReserve', calls: launches.map(i => i.curve) })
  reserves.forEach((reserve, i) => api.add(launches[i].pairToken, reserve))
}

module.exports = {
  methodology: 'TVL is the quote asset (native ETH or another approved pair token) backing active LoopUP bonding curves on Robinhood Chain, excluding fees waiting to be swept. Curves are found from the TokenLaunched events of both LoopUP launch factories. Graduated coins move their reserve into Uniswap V4 pools, which are counted under Uniswap V4, not here.',
  start: '2026-11-06',
  robinhood: { tvl },
}
