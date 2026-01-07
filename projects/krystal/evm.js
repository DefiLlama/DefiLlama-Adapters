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
          },
          {
            factory: "0xc8f4d6860e77c9f05a391d3e247a4146c38da203",
            fromBlock: 31938923
          },
          {
            factory: "0xdf2deefe9e905db881d06b063d3e96c27bcfda7a",
            fromBlock: 32253341,
            customOwnerFee: true
          },
          {
            factory: "0x3a35f9fef2ba83702b6e20d79fff96f77c922cf3",
            fromBlock: 32588280,
            customOwnerFee: true
          },
          {
            factory: "0x87077592b446e9207c544c5614e19b56bc6970d5",
            fromBlock: 33537305,
            customOwnerFee: true
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
            {
              factory: "0xc8f4d6860e77c9f05a391d3e247a4146c38da203",
              fromBlock: 351376737,
            },
            {
              factory: "0xdf2deefe9e905db881d06b063d3e96c27bcfda7a",
              fromBlock: 353725498,
              customOwnerFee: true
            },
            {
              factory: "0x3a35f9fef2ba83702b6e20d79fff96f77c922cf3",
              fromBlock: 359319739,
              customOwnerFee: true
            },
            {
              factory: "0x87077592b446e9207c544c5614e19b56bc6970d5",
              fromBlock: 365137843,
              customOwnerFee: true
            }
        ]
    },
    polygon: {
        factories: [
            {
              factory: "0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0",
              fromBlock: 70786808
            },
            {
              factory: "0xc8f4d6860e77c9f05a391d3e247a4146c38da203",
              fromBlock: 73241511,
            },
            {
              factory: "0xdf2deefe9e905db881d06b063d3e96c27bcfda7a",
              fromBlock: 73516877,
              customOwnerFee: true
            },
            {
              factory: "0x3a35f9fef2ba83702b6e20d79fff96f77c922cf3",
              fromBlock: 74146941,
              customOwnerFee: true
            },
            {
              factory: "0x87077592b446e9207c544c5614e19b56bc6970d5",
              fromBlock: 74819808,
              customOwnerFee: true
            }
        ]
    },
    bsc: {
      factories: [
          {
            factory: "0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0",
            fromBlock: 48703522
          },
          {
            factory: "0xc8f4d6860e77c9f05a391d3e247a4146c38da203",
            fromBlock: 52127753,
          },
          {
            factory: "0xdf2deefe9e905db881d06b063d3e96c27bcfda7a",
            fromBlock: 52701228,
            customOwnerFee: true
          },
          {
            factory: "0x3a35f9fef2ba83702b6e20d79fff96f77c922cf3",
            fromBlock: 54567569,
            customOwnerFee: true
          },
          {
            factory: "0x87077592b446e9207c544c5614e19b56bc6970d5",
            fromBlock: 56504339,
            customOwnerFee: true
          }
      ]
    },
    ethereum: {
      factories: [
          {
            factory: "0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0",
            fromBlock: 22374491
          },
          {
            factory: "0xc8f4d6860e77c9f05a391d3e247a4146c38da203",
            fromBlock: 22788449,
          },
          {
            factory: "0xdf2deefe9e905db881d06b063d3e96c27bcfda7a",
            fromBlock: 22836895,
            customOwnerFee: true
          },
          {
            factory: "0x3a35f9fef2ba83702b6e20d79fff96f77c922cf3",
            fromBlock: 22952824,
            customOwnerFee: true
          },
          {
            factory: "0x87077592b446e9207c544c5614e19b56bc6970d5",
            fromBlock: 23073168,
            customOwnerFee: true
          }
      ]
    },
    ronin: {
      factories: [
          {
            factory: "0x3f06f7d2ab15f42b92f3e8b266f79d4e831e702b",
            fromBlock: 45377320
          },
          {
            factory: "0xc8f4d6860e77c9f05a391d3e247a4146c38da203",
            fromBlock: 46360967,
          },
          {
            factory: "0xdf2deefe9e905db881d06b063d3e96c27bcfda7a",
            fromBlock: 46556861,
            customOwnerFee: true
          },
          {
            factory: "0x3a35f9fef2ba83702b6e20d79fff96f77c922cf3",
            fromBlock: 46876463,
            customOwnerFee: true
          },
          {
            factory: "0x87077592b446e9207c544c5614e19b56bc6970d5",
            fromBlock: 47505286,
            customOwnerFee: true
          }
      ]
    }
}

const excludedVaults = ["0xa9d939b440889946E6CEC3E1D4218E069605af6f", "0xC1592E4Ce1FB6B9E278E209483CC9B2107a1736f", '0x516Df58459771d20A57947203871B02af1f20B1B']

const abis = {
  getTotalValue: "function getTotalValue() view returns (uint256 totalValue)",
  getVaultConfig: "function getVaultConfig() view returns (bool allowDeposit,uint8 rangeStrategyType,uint8 tvlStrategyType,address principalToken,address[] memory supportedAddresses)",
  getVaultConfigWithCustomOwnerFee: "function getVaultConfig() view returns (bool allowDeposit,uint8 rangeStrategyType,uint8 tvlStrategyType,address principalToken,address[] memory supportedAddresses,uint16 vaultOwnerFeeBasisPoint)",
  eventVaultCreatedTopic: "0xbdbed56de8b743294aafeb7bc338aac69f80294b14d029f6b73168946225f817",
  eventVaultCreatedAbi: "event VaultCreated(address owner, address vault, tuple(string name, string symbol, uint256 principalTokenAmount, tuple(bool allowDeposit, uint8 rangeStrategyType, uint8 tvlStrategyType, address principalToken, address[] supportedAddresses) config) params)",
  eventVaultCreatedWithCustomOwnerFeeTopic: "0x64ebc17e4f1cfa3b3dc33c6b6e50fd0cb0f9fe4fd739a3742ddfad53b50107c7",
  eventVaultCreatedWithCustomOwnerFeeAbi: "event VaultCreated(address owner, address vault, tuple(string name, string symbol, uint256 principalTokenAmount, uint16 vaultOwnerFeeBasisPoint, tuple(bool allowDeposit, uint8 rangeStrategyType, uint8 tvlStrategyType, address principalToken, address[] supportedAddresses) config) params)"
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaultAddresses = [];
      const vaultAddressesCustomOwnerFee = [];
 
      for (const { factory, fromBlock, customOwnerFee } of config[chain].factories) {
        if (customOwnerFee) {
          const logs = await getLogs({
            api,
            target: factory,
            topics: [abis.eventVaultCreatedWithCustomOwnerFeeTopic],
            eventAbi: abis.eventVaultCreatedWithCustomOwnerFeeAbi,
            onlyArgs: true,
            fromBlock: fromBlock,
          })
          logs.forEach(i => {
            if (excludedVaults.includes(i.vault)) return;
            vaultAddressesCustomOwnerFee.push(i.vault)
          })
        } else {
          const logs = await getLogs({
            api,
            target: factory,
            topics: [abis.eventVaultCreatedTopic],
            eventAbi: abis.eventVaultCreatedAbi,
            onlyArgs: true,
            fromBlock: fromBlock,
          })
          logs.forEach(i => {
            if (excludedVaults.includes(i.vault)) return;
            vaultAddresses.push(i.vault)
          })
        }
      }

      const [vaultConfigs, vaultTotalValues, vaultCustomOwnerFeeConfigs, vaultCustomOwnerFeeTotalValues] = await Promise.all([
        api.multiCall({ abi: abis.getVaultConfig, calls: vaultAddresses }),
        api.multiCall({ abi: abis.getTotalValue, calls: vaultAddresses }),
        api.multiCall({ abi: abis.getVaultConfigWithCustomOwnerFee, calls: vaultAddressesCustomOwnerFee }),
        api.multiCall({ abi: abis.getTotalValue, calls: vaultAddressesCustomOwnerFee }),
      ])

      const principleTokens = vaultConfigs.map(i => i.principalToken)
      api.addTokens(principleTokens, vaultTotalValues)

      const principleTokensCustomOwnerFee = vaultCustomOwnerFeeConfigs.map(i => i.principalToken)
      api.addTokens(principleTokensCustomOwnerFee, vaultCustomOwnerFeeTotalValues)
    }
  }
})
