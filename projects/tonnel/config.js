const ADDRESSES = require('../helper/coreAssets.json')

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
      tokens: [ADDRESSES.ton.TONNEL],   // TONNEL
      holders: [
        "EQDTs-yjPLn7XzaRRq8pjp7H8Nw4y_OJ51Bk2dcrPlIYgwtV", // 10000 TONNEL
        "EQAgoyECSzCIFTFkMIvDLgdUE3D9RxGfYQQGfxy3lBBc_Ke_", // 1000 TONNEL
        "EQDzAhS3Ev8cxEBJ96MIqPjxyD_k0L3enzDWnQ3Z-4tUK1h5", // 200 TONNEL
        "EQASyc8d2DjZHrFevnF432NRLc4qwh6HGUPAbMvbofMkeRZl", // 50 TONNEL
        "EQCNoApBzMacKKdTwcvi1iOx78e98bTSaN1Gx_nnmd3Ek5Yn", // 66 TONNEL
      ],
    },
    {
      tokens: [ADDRESSES.ton.GRAM],   // GRAM
      holders: [
        "EQD7U_FPYRFTGgiqrpiKh8_giyrIQHZtokUKvz2EmWvlmViC", // 500k GRAM
        "EQCZXyOWRih3jtyhdCA7DV7KXluNbzqeIpJPnRkF4KEE1STp", // 30k GRAM
      ],
    },
    {
      tokens: [ADDRESSES.ton.DFC],   // DFC
      holders: [
          "EQC14SC0-P0iOXzn1971HVIDsCzQ0LllY0y5O7EE2pMLe9pT" // 100 DFC
      ],
    },
  ],
}