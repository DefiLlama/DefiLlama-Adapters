const { getLogs2 } = require('../helper/cache/getLogs')

const FACTORY = '0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e'
const fromBlock = 27000000

// The factory emits one TokenLaunched per coin (the bonding curve holds the quote asset), and one
// PoolGraduated when a coin leaves its curve for a Uniswap V4 pool.
const TokenLaunched = 'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)'
const PoolGraduated = 'event PoolGraduated(address indexed token, uint256 positionId, uint256 tokenAmount, uint256 pairTokenAmount)'

async function tvl(api) {
  const [launches, graduations] = await Promise.all([
    getLogs2({ api, target: FACTORY, eventAbi: TokenLaunched, fromBlock, extraKey: 'launched' }),
    getLogs2({ api, target: FACTORY, eventAbi: PoolGraduated, fromBlock, extraKey: 'graduated'}), 
  ])

  const graduated = new Set(graduations.map(i => i.token.toLowerCase()))
  // Each active (non-graduated) curve holds its pairToken (native ETH for most coins, or another
  // approved quote token) as the bonding-curve reserve. A graduated coin's reserve has moved into a
  // Uniswap V4 pool, so it is excluded to avoid double counting.
  const ownerTokens = launches
    .filter(i => !graduated.has(i.token.toLowerCase()))
    .map(i => [[i.pairToken], i.curve])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology:
    'TVL is the quote asset (native ETH and other approved pair tokens) held by active Pons V2 bonding curves on Robinhood Chain. Curves are enumerated from the factory\'s TokenLaunched events and excluded once their PoolGraduated event fires, since a graduated coin\'s reserve moves into a Uniswap V4 pool.',
  robinhood: { tvl },
}
