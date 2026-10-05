const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// https://docs.sushi.com/contracts/v4
// https://github.com/sushi-labs/infinity-deployments/tree/main/chains
const vault = '0xeb4F1e157D18B1a4D09a5207A96e17601ea354b2'
const clPoolManager = '0x81D732702f87D2D652aE79e9F52bf44928eCA210'
const config = {
  ethereum: {
    vault, clPoolManager, fromBlock: 25697704,
  },
  base: {
    vault, clPoolManager, fromBlock: 49625896,
  },
  arbitrum: {
    vault, clPoolManager, fromBlock: 491793604,
  },
  polygon: {
    vault, clPoolManager, fromBlock: 91557505,
  },
  bsc: {
    vault, clPoolManager, fromBlock: 114402903,
  },
  unichain: {
    vault, clPoolManager, fromBlock: 55293055,
  },
  wc: {
    vault, clPoolManager, fromBlock: 33352957,
  },
  robinhood: {
    vault, clPoolManager, fromBlock: 29573673,
  },
  arc: {
    vault, clPoolManager, fromBlock: 21010166,
  },
}

module.exports.methodology = 'Sum of pool currencies held in the SushiSwap V4 Vault, discovered from CLPoolManager Initialize events.'

Object.entries(config).forEach(([chain, { vault, clPoolManager, fromBlock }]) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({
        api,
        target: clPoolManager,
        fromBlock,
        // The SDK event-log cache adds 10 blocks, which can exceed Base's head.
        ...(chain === 'base' ? { useIndexer: false } : {}),
        eventAbi: 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)',
      })

      // On Arc, USDC is the gas token and the ERC-20 at 0x3600... reads the same balance as the native coin.
      // Pools quoted in each would count the Vault's USDC twice, so read native through the ERC-20.
      const normalize = (token) => {
        token = token.toLowerCase()
        if (chain === 'arc' && token === ADDRESSES.null) return ADDRESSES.arc.USDC
        return token
      }

      const tokens = new Set()
      logs.forEach(({ currency0, currency1 }) => {
        tokens.add(normalize(currency0))
        tokens.add(normalize(currency1))
      })

      // Infinity pools hold their assets in the Vault, not the pool manager.
      return sumTokens2({ api, owner: vault, tokens: [...tokens] })
    },
  }
})
