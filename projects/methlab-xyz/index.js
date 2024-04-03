const { getLogs } = require('../helper/cache/getLogs')
const { mergeExports } = require('../helper/utils')
const { uniV3Export } = require('../helper/uniswapV3')
const config = {
  mantle: {
    factories: [{ target: '0x6Cc0c2D8F9533dFd2276337DdEaBBCEE9dd0747F', fromBlock: 51253051 },],
  }
}

Object.keys(config).forEach(chain => {
  const { factories } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = []
      for (const { target, fromBlock, } of factories) {
        const logs = await getLogs({ api, target, fromBlock, onlyArgs: true, eventAbi: 'event VaultAdded (address indexed vault)' })
        vaults.push(...logs.map(log => log.vault))
      }
      const counters = await api.multiCall({ abi: abi.collectionCounter, calls: vaults })
      const callOwners = []
      const calls = []
      for (let i = 0; i < vaults.length; i++) {
        const counter = counters[i]
        for (let j = 0; j < +counter; j++) {
          calls.push({ target: vaults[i], params: j })
          callOwners.push(vaults[i])
        }
      }
      const results = await api.multiCall({ abi: abi.collection, calls })
      const tokenSet = new Set()
      results.forEach((result, i) => {
        tokenSet.add(result.collToken)
        tokenSet.add(result.borrowToken)
        // tokensAndOwners.push([result.collToken, callOwners[i]])
        // tokensAndOwners.push([result.borrowToken, callOwners[i]])
      })
      return api.sumTokens({ owners: vaults, tokens: Array.from(tokenSet), blacklistedTokens: ['0x401307732d732dd3b05ac1138b8661c0f55830ea'] })
    }
  }
})

const abi = {
  "collection": "function collection(uint256 collectionId) view returns ((address collToken, address borrowToken, uint256 minSingleLoanAmt, uint256 maxSingleLoanAmt, uint256 expiresAt, bool isEnabled, (uint256 strikePrice, uint256 interestRate, uint256 duration)[] intents))",
  "collectionCounter": "uint256:collectionCounter",
}

module.exports = mergeExports([
  module.exports,
  uniV3Export({
    mantle: { factory: "0x8f140Fc3e9211b8DC2fC1D7eE3292F6817C5dD5D", fromBlock: 59915640 },
  })
])