const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
    base: {
        tvl: sumTokensExport({ owners: 
            [
              "0xFD09F108D1728E6B6eD241ccd254775e322f1ed6",
              "0x8a2fFD429d33FBfC6f5A91aa207e48bB095Db7d9"
        ], tokens: [
            ADDRESSES.null,
            ADDRESSES.base.USDC,
            ADDRESSES.base.WETH,
        ]}),
    }
}; 