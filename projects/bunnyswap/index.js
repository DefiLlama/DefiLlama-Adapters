const { sumTokensExport } = require("../helper/unwrapLPs")

module.exports={
    base: {
        tvl: sumTokensExport({
            tokens:[
                "0x4200000000000000000000000000000000000006",
                "0x0bD4887f7D41B35CD75DFF9FfeE2856106f86670"
            ],
            owners:[
                "0x7cfc830448484cdf830625373820241e61ef4acf"
            ]
        })
      },
}