const { nullAddress, sumTokensExport } = require("../helper/unwrapLPs");

module.exports={
    base: {
        tvl: sumTokensExport({ tokens: [nullAddress], owner: "0xaeea89678b36c20493e2c069cdcea72e1b34a9ed" })
    }
}