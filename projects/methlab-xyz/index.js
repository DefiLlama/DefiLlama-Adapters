const { getLogs } = require('../helper/cache/getLogs')
const config = {
  mantle: {
    factories: [{ target: '0x6Cc0c2D8F9533dFd2276337DdEaBBCEE9dd0747F', fromBlock: 51253051 },],
  }
}

Object.keys(config).forEach(chain => {
  const { factories } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
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
      return api.sumTokens({ owners: vaults, tokens: Array.from(tokenSet) })
    }
  }
})

const abi = {
  "collection": "function collection(uint256 collectionId) view returns ((address collToken, address borrowToken, uint256 minSingleLoanAmt, uint256 maxSingleLoanAmt, uint256 expiresAt, bool isEnabled, (uint256 strikePrice, uint256 interestRate, uint256 duration)[] intents))",
  "collectionCounter": "uint256:collectionCounter",
}