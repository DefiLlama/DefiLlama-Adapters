const { getLogs } = require('../helper/cache/getLogs');

const config = {
    base: {
        factories: [
          {
            factory: "0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0",
            fromBlock: 29449424
          },
          {
            factory: "0xd3de3b39feb0d21fe02c9e385315ddc9ca99dfd5",
            fromBlock: 29303413
          }
        ],
    },
    arbitrum: {
        factories: [
            {
              factory: "0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0",
              fromBlock: 330479415,
            },
            {
              factory: "0x92c355c372eb9c1eca92a0962610626a8b2ce975",
              fromBlock: 329400485,
            },
        ]
    },
    polygon: {
        factories: [
            {
              factory: "0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0",
              fromBlock: 70786808
            },
        ]
    },
    bsc: {
      factories: [
          {
            factory: "0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0",
            fromBlock: 48703522
          },
      ]
    },
    ethereum: {
      factories: [
          {
            factory: "0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0",
            fromBlock: 22374491
          },
      ]
    },
}

const abis = {
    getTotalValue: "function getTotalValue() external returns (uint256)",
    getVaultConfig: "function getVaultConfig() view returns (bool allowDeposit,uint8 rangeStrategyType,uint8 tvlStrategyType,address principalToken,address[] memory supportedAddresses)",
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaultAddresses = []
      for (const { factory, fromBlock } of config[chain].factories) {
        const logs = await getLogs({
          api,
          target: factory,
          topics: ["0xbdbed56de8b743294aafeb7bc338aac69f80294b14d029f6b73168946225f817"],
          eventAbi: "event VaultCreated(address owner, address vault, tuple(string name, string symbol, uint256 principalTokenAmount, tuple(bool allowDeposit, uint8 rangeStrategyType, uint8 tvlStrategyType, address principalToken, address[] supportedAddresses) config) params)",
          onlyArgs: true,
          fromBlock: fromBlock,
        })
        logs.forEach(i => vaultAddresses.push(i.vault))
      }

      const [vaultConfigs, vaultTotalValues] = await Promise.all([
        api.multiCall({  abi: abis.getVaultConfig, calls: vaultAddresses }),
        api.multiCall({  abi: abis.getTotalValue, calls: vaultAddresses }),
      ])

      const principleTokens = vaultConfigs.map(i => i.principalToken)
      api.addTokens(principleTokens, vaultTotalValues)
    }
  }
})
