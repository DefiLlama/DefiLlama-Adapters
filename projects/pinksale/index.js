const sdk = require("@defillama/sdk")
const abi = require('./abi')
const config = require('./config')
const { vestingHelper } = require('../helper/unknownTokens')

module.exports = {}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (timestamp, _block, { [chain]: block }) => {
      const balances = {}
      const { vaults, blacklist, log_coreAssetPrices, log_minTokenValue, } = config[chain]
      for (const vault of vaults) {

        let calls = []
        const { output: size } = await sdk.api.abi.call({
          target: vault,
          abi: abi.getTotalLockCount,
          chain, block,
        })

        const isLastVault = vault === vaults[vaults.length - 1]
        const lockAbi = isLastVault ? abi.getLockAt : abi.getLock
        for (let i = 0; i < +size; i++)
          calls.push({ params: i })
        let { output: tokens } = await sdk.api.abi.multiCall({
          target: vault,
          abi: lockAbi,
          calls,
          chain, block,
        })

        tokens = tokens.map(i => i.output[1])
        const balance = await vestingHelper({
          useDefaultCoreAssets: true,
          blacklist,
          owner: vault,
          tokens,
          block, chain,
          log_coreAssetPrices,
          log_minTokenValue,
        })

        Object.entries(balance).forEach(([token, bal]) => sdk.util.sumSingleBalance(balances, token, bal))
      }

      return balances
    }

  }
})
