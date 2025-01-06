const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

module.exports={
    base: {
        tvl: sumTokensExport({
            tokens:[
                ADDRESSES.optimism.WETH_1,
                "0x0bD4887f7D41B35CD75DFF9FfeE2856106f86670"
            ],
            owners:[
                "0x7cfc830448484cdf830625373820241e61ef4acf"
            ]
        })
      },
}