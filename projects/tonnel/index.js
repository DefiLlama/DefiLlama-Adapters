const { sumTokensExport } = require('../helper/chain/ton')

const ADDRESSES = require('../helper/coreAssets.json')
const tokens = {
  "GRAM": "0:b8ef4f77a17e5785bd31ba4da50abd91852f2b8febee97ad6ee16d941f939198", // EQC47093oX5Xhb0xuk2lCr2RhS8rj-vul61u4W2UH5ORmG_O
  "DFC": "0:f6eb371de82aa9cfb5b22ca547f31fdc0fa0fbb41ae89ba84a73272ff0bf2157"//EQD26zcd6Cqpz7WyLKVH8x_cD6D7tBrom6hKcycv8L8hV0GP
}
const config = {
  ton: [
    {
      tokens: [ADDRESSES.null],
      holders: [
        "EQBemaU1eAM-fJP7tSniJGEmltPjitgGnlrP6UaXI7nzmEuV", // 5 TON
        "EQBZ0-2-isPEN_lIyg9eqXO_RFWrl_PWIJq5K6SVcUwne23W", // 50 TON
        "EQBYpQiQMwGBMzhOlJ52e4yXmcKCB_5uTTJ7bVSGqr-8YANi", // 250 TON
        "EQB-s4WzIgGP9U6DNlFH_kSn0JuxhBCBXr_rKz2ztEiozTto", // 1000 TON
      ],
    },
    {
      tokens: [tokens.GRAM],   // GRAM
      holders: [
        "EQD7U_FPYRFTGgiqrpiKh8_giyrIQHZtokUKvz2EmWvlmViC", // 500k GRAM
        "EQCZXyOWRih3jtyhdCA7DV7KXluNbzqeIpJPnRkF4KEE1STp", // 30k GRAM
      ],
    },
    {
      tokens: [tokens.DFC],   // DFC
      holders: [
        "EQC14SC0-P0iOXzn1971HVIDsCzQ0LllY0y5O7EE2pMLe9pT" // 100 DFC
      ],
    },
  ],
};
const tonnel = "0:cd0efe78bff4c4539b76eab17293296c74f42cbf99ec499687fefec94893ed32" //EQDNDv54v_TEU5t26rFykylsdPQsv5nsSZaH_v7JSJPtMitv
const tonnelHolders = [
  "EQDTs-yjPLn7XzaRRq8pjp7H8Nw4y_OJ51Bk2dcrPlIYgwtV", // 10000 TONNEL
  "EQAgoyECSzCIFTFkMIvDLgdUE3D9RxGfYQQGfxy3lBBc_Ke_", // 1000 TONNEL
  "EQDzAhS3Ev8cxEBJ96MIqPjxyD_k0L3enzDWnQ3Z-4tUK1h5", // 200 TONNEL
  "EQASyc8d2DjZHrFevnF432NRLc4qwh6HGUPAbMvbofMkeRZl", // 50 TONNEL
  "EQCNoApBzMacKKdTwcvi1iOx78e98bTSaN1Gx_nnmd3Ek5Yn", // 66 TONNEL
]

Object.keys(config).forEach((chain) => {
  const tokenSet = new Set()
  const owners = config[chain].map(({ tokens, holders }) => {
    tokens.forEach(i => tokenSet.add(i))
    return holders
  }).flat()

  module.exports[chain] = {
    tvl: sumTokensExport({ owners, tokens: [...tokenSet], onlyWhitelistedTokens: true, })
  }
  if (chain === 'ton')
    module.exports.ton.staking = sumTokensExport({ owners: tonnelHolders, tokens: [tonnel], onlyWhitelistedTokens: true,})
})