const { getLogs } = require('../helper/cache/getLogs')

const abi = {
  "getTotalAmounts": "function getTotalAmounts() view returns (uint256 total0, uint256 total1)",
}

module.exports = {
  methodology: "Vault deposits",
  misrepresentedTokens: true,
  doublecounted: true,
} // node test.js projects/thedeep/index.js

const eventAbi = 'event ICHIVaultCreated (address indexed sender, address ichiVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint24 fee, uint256 count)'
const topic = '0xde147f43b6837f282eee187234c866cf001806167325f3ea883e36bed0c16a20'

const config = {
  base: {
    vaultConfigs: [
      { factory: '0xBff23e60F41A11cf131B7180Cbd2BD3d47d17ad1', fromBlock: 32389228, }, // Aerodrome Legacy
      { factory: '0xf6B5Ab192F2696921F60a1Ff00b99596C4045FA6', fromBlock: 34267944, }, // Aerodrome
      { factory: '0xaBe5B5AC472Ead17B4B4CaC7fAF42430748ab3b3', fromBlock: 12978552, }, // Uniswap 
    ]
  },
  celo: {
    vaultConfigs: [
      { factory: '0xB3bf88Cb919a222A6F9c90ca8a9ac261CBD3e5bF', fromBlock: 38293141, }, // Velodrome Legacy
      { factory: '0x82DcA62C4B5Dd28Cc85CE8Ae3B170Ce020e33870', fromBlock: 38293141, }, // Velodrome
    ],
  },
  flow: {
    vaultConfigs: [
      { factory: '0x3bE78614342C7763d87520b2502085761Aa4e5f8', fromBlock: 39081014, }, // KittyPunch
    ],
  },
  ink: {
    vaultConfigs: [
      { factory: '0x65CD1f0ac298519BE4891B5812053e00BD2074AC', fromBlock: 1303936, }, // Reservoir (v1.1)
      { factory: '0x64dA1Ab5b42c71E8FaF1664745af911B859A06D4', fromBlock: 16767552, }, // Velodrome (fee) Legacy
      { factory: '0x822b0bE4958ab5b4A48DA3c5f68Fc54846093618', fromBlock: 21830207, }, // Velodrome (fee)
    ],
  },
  katana: {
    vaultConfigs: [
      { factory: '0x9176B8Eb7Fdff309BE258F2F2eDB32a8b79f19B5', fromBlock: 4739302, }, // Sushi
    ]
  },
  hemi: {
    vaultConfigs:[
      { factory: '0x5541Bcd3d163326CF12267D1cF6207dbde788348', fromBlock: 2624151, }, // Sushi
    ]
  },
}

Object.keys(config).forEach(chain => {
  const { vaultConfigs = [], oneFactory } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const blacklistedTokens = []

      for (const {
        factory,
        fromBlock,
      } of vaultConfigs) {
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
