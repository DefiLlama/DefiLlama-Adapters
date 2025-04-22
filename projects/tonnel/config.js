const ADDRESSES = require('../helper/coreAssets.json')
const tokens = {
  "GRAM": "0:b8ef4f77a17e5785bd31ba4da50abd91852f2b8febee97ad6ee16d941f939198", // EQC47093oX5Xhb0xuk2lCr2RhS8rj-vul61u4W2UH5ORmG_O
  "DFC": "0:f6eb371de82aa9cfb5b22ca547f31fdc0fa0fbb41ae89ba84a73272ff0bf2157"//EQD26zcd6Cqpz7WyLKVH8x_cD6D7tBrom6hKcycv8L8hV0GP
}

module.exports = {
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
}