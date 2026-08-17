const { getLogs2 } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { sliceIntoChunks } = require('../helper/utils');

const config = {
  bsc: { vault: '0x3754Bd79D88e89F397ed1BfFAD8cdf3E0FDCC37E', clPoolManager: '0x9d3b119EfF69Cd81d324f654062b6fFA3Dd7f405', binPoolManager: '0xd7a5A9Df1719Ee83a4d10749019CaABf137DeBAC', fromBlock: 74380131 },
  base: { vault: '0x126C5D558589788292c33667FBa07E07b4b0990b', clPoolManager: '0xbb07A7bDFC50829cE932aDCCC0498F0E29F49F50', binPoolManager: '0xd243e0C2fC2a91eAce239E0C54023559A47C5f04', fromBlock: 40500004 },
}

const clEventAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)'
const binEventAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint24 activeId)'

Object.keys(config).forEach(chain => {
  const { vault, clPoolManager, binPoolManager, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {

      const fiveHoursAgo = Math.floor(Date.now() / 1000) - 5 * 3600
      if (api.timestamp > fiveHoursAgo) {
        api.block = undefined
      }

      const [clLogs, binLogs] = await Promise.all([
        getLogs2({ api, target: clPoolManager, fromBlock, eventAbi: clEventAbi }),
        getLogs2({ api, target: binPoolManager, fromBlock, eventAbi: binEventAbi }),
      ])

      const tokenSet = new Set()

      clLogs.concat(binLogs).forEach(log => {
        tokenSet.add(String(log.currency0).toLowerCase())
        tokenSet.add(String(log.currency1).toLowerCase())
      })

      const tokens = Array.from(tokenSet)

      const tokenChunks = sliceIntoChunks(tokens, 1000)

      for (const tokens of tokenChunks) {
        await sumTokens2({ api, tokens, owner: vault, permitFailure: true })
      }
    }
  }
})

module.exports.methodology = 'TVL is the sum of all tokens held in the SquadSwap Thanos (v4) Vault, tokens are discovered from the Initialize events of the CL and Bin pool managers'
