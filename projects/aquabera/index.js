const { getLogs2 } = require('../helper/cache/getLogs')

module.exports = {
  methodology: "Vault deposits",
  doublecounted: true,
}

const defaultEvent = 'event ICHIVaultCreated (address indexed sender, address ichiVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint24 fee, uint256 count)'
const algebraEvent = 'event ICHIVaultCreated (address indexed sender, address ichiVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint256 count)'

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
      for (const { factory, fromBlock, isAlgebra, } of vaultConfigs) {
        const eventAbi = isAlgebra ? algebraEvent : defaultEvent
        const logs = await getLogs2({ api, target: factory, eventAbi: eventAbi, fromBlock, })
        const vaultBalances = await api.multiCall({ abi: "function getTotalAmounts() view returns (uint256 total0, uint256 total1)", calls: logs.map(l => l.ichiVault), permitFailure: true })
        vaultBalances.forEach((b, i) => {
          if (!b) return
          const { tokenA, tokenB } = logs[i]
          api.add(tokenA, b.total0)
          api.add(tokenB, b.total1)
        })
      }
    }
  }
})
