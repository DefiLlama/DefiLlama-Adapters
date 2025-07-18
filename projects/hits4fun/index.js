const { sumTokens2 } = require('../helper/unwrapLPs')

const ADDRESSES = require('../helper/coreAssets.json')

const VAULT_ADDRESS = '0xDcC2BDbEE24813a4000Afd58252a462ff226bFA1'

module.exports = {
  methodology: 'Counts the amount of ETH in the vault',
  start: 1751443965, // Wed Jul 02 2025 08:12:45 GMT+0000
  base: {
    tvl: async (api) => {
      return sumTokens2({
        api,
        tokens: [
          ADDRESSES.null, // Native token
        ],
        owners: [
          VAULT_ADDRESS,
        ]
      })
    }
  }
}
