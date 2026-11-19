const { getLogs2 } = require('../helper/cache/getLogs')

const FACTORY = '0xed355f423a5158347beb562c250f6095efcdb25b'
const fromBlock = 55493136

// Pez emits one TokenLaunched event per token. The corresponding bonding curve
// holds the quote asset until the token graduates into a Uniswap V4 pool.
const TokenLaunched = 'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)'
const PoolGraduated = 'event PoolGraduated(address indexed token, uint256 positionId, uint256 tokenAmount, uint256 pairTokenAmount)'

async function tvl(api) {
  const [launches, graduations] = await Promise.all([
    getLogs2({ api, target: FACTORY, eventAbi: TokenLaunched, fromBlock, extraKey: 'launched' }),
    getLogs2({ api, target: FACTORY, eventAbi: PoolGraduated, fromBlock, extraKey: 'graduated' }),
  ])

  const graduated = new Set(graduations.map(i => i.token.toLowerCase()))
  const ownerTokens = launches
    .filter(i => !graduated.has(i.token.toLowerCase()))
    .map(i => [[i.pairToken], i.curve])

  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology:
    'TVL is the quote asset (native ETH and approved pair tokens) held by active Pez bonding curves on Robinhood Chain. Curves are enumerated from the factory TokenLaunched events and excluded after their PoolGraduated event, when the reserve moves into a Uniswap V4 pool.',
  robinhood: { tvl },
}
