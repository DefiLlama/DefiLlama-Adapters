const { getLogs2 } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

// pre-audit deployments first, post-audit redeployments (2026-09-22) after
const config = {
  bsc: [
    { vault: '0x3754Bd79D88e89F397ed1BfFAD8cdf3E0FDCC37E', clPoolManager: '0x9d3b119EfF69Cd81d324f654062b6fFA3Dd7f405', binPoolManager: '0xd7a5A9Df1719Ee83a4d10749019CaABf137DeBAC', fromBlock: 74380131 },
    { vault: '0xb1ba60cdB44C88Ec5366ab94dcB2F992B31f71F2', clPoolManager: '0xb9A52e6b7E98Bf7E80e0BDC8cBEe97D7e1314F22', binPoolManager: '0x7f8E5a02F9007b19408EF731982aDBbA7Ae08eB1', fromBlock: 122889520 },
  ],
  base: [
    { vault: '0x126C5D558589788292c33667FBa07E07b4b0990b', clPoolManager: '0xbb07A7bDFC50829cE932aDCCC0498F0E29F49F50', binPoolManager: '0xd243e0C2fC2a91eAce239E0C54023559A47C5f04', fromBlock: 40500004 },
    { vault: '0x8C2eAA0cD1506D9e2e83D350E771Afd180e15bd8', clPoolManager: '0xFeB042baBAbeb8A669897a499d51a8A07F2B260a', binPoolManager: '0xD5727D30Bc1dBb98DC74E34eD535fc570B17Ad27', fromBlock: 51536527 },
  ],
  ethereum: [
    { vault: '0xe2682718E44574556f0449722191F1734992D20d', clPoolManager: '0xB930ed3581Aae632bB1788b28777C50BF2C6A85d', binPoolManager: '0xA61093C554d58ee0b0108ad71cDc57c396F04313', fromBlock: 26354460 },
  ],
}

const clEventAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)'
const binEventAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint24 activeId)'

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = await Promise.all(config[chain].map(async ({ vault, clPoolManager, binPoolManager, fromBlock }) => {
        const [clLogs, binLogs] = await Promise.all([
          getLogs2({ api, target: clPoolManager, fromBlock, eventAbi: clEventAbi }),
          getLogs2({ api, target: binPoolManager, fromBlock, eventAbi: binEventAbi }),
        ])
        const tokenSet = new Set()
        clLogs.concat(binLogs).forEach(log => {
          tokenSet.add(String(log.currency0).toLowerCase())
          tokenSet.add(String(log.currency1).toLowerCase())
        })
        return [Array.from(tokenSet), vault]
      }))

      return sumTokens2({ api, ownerTokens })
    }
  }
})

module.exports.methodology = 'TVL is the sum of all tokens held in the SquadSwap Thanos (v4) Vaults, both the original and the post-audit redeployments, tokens are discovered from the Initialize events of the CL and Bin pool managers'
