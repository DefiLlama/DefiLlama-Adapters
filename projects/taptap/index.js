const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
    taiko: {
        tvl: sumTokensExport({ owners: 
            [
              "0x36B275207e53273e2EF0a24471FBa0ac8b97D532",
              "0x29263dcedbc27644ccfc51819c6c4bed127859c9"
        ], tokens: [
            ADDRESSES.null,
            ADDRESSES.taiko.USDC,
            ADDRESSES.taiko.WETH,
        ]}),
    }
}; 