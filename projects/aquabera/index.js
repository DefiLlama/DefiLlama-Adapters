const { getLogs } = require('../helper/cache/getLogs')
const abi = require("./abi.json");


module.exports = {
  methodology: "Vault deposits",
  misrepresentedTokens: true,
  doublecounted: true,
} // node test.js projects/aquabera/index.js

const defaultEvent = 'event ICHIVaultCreated (address indexed sender, address ichiVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint24 fee, uint256 count)'
const defaultTopic = '0xde147f43b6837f282eee187234c866cf001806167325f3ea883e36bed0c16a20'
const algebraEvent = 'event ICHIVaultCreated (address indexed sender, address ichiVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint256 count)'
const algebraTopic = '0xc40564e4b61a849e6f9fd666c2109aa6ceffc5a019f87d4d3e0eaaf807b0783e'

const config = {
    berachain: {
      vaultConfigs: [
        { factory: '0x1bf5e51eCacdfEA65ae9276fd228bB8719ffcA7E', fromBlock: 788774, isAlgebra: true, }, // Honeypot
        { factory: '0x8cCd02E769e6A668a447Bd15e134C31bEccd8182', fromBlock: 784713, isAlgebra: false, }, // Kodiak
        { factory: '0x7d125D0766C968353454b7A67bB2D61a97E5665d', fromBlock: 969565, isAlgebra: true, }, // Wasabee
      ],
    },
}

Object.keys(config).forEach(chain => {
  const { vaultConfigs = [] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const blacklistedTokens = []

      for (const { 
        factory, 
        fromBlock, 
        isAlgebra, 
      } of vaultConfigs) {
        const topic = isAlgebra ? algebraTopic : defaultTopic 
        const eventAbi = isAlgebra ? algebraEvent : defaultEvent 
        const logs = await getLogs({
          api,
          target: factory,
          topics: [topic],
          eventAbi: eventAbi,
          onlyArgs: true,
          fromBlock,
        })
        const vaultBalances = await api.multiCall({ abi: abi.getTotalAmounts, calls: logs.map(l => l.ichiVault), permitFailure: true })
        vaultBalances.forEach((b, i) => {
          if (!b) return
          const { tokenA, tokenB } = logs[i]
          if (!blacklistedTokens.includes(tokenA.toLowerCase())) api.add(tokenA, b.total0)
          if (!blacklistedTokens.includes(tokenB.toLowerCase())) api.add(tokenB, b.total1)
        })
      }

      return api.getBalances()
    }
  }
})
