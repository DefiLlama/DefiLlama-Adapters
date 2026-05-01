const { sumTokensExport } = require("../helper/sumTokens");

const USDnr = "0xD48e565561416dE59DA1050ED70b8d75e8eF28f9";
const mToken = "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b";

module.exports = {
    methodology: "TVL counts the total value of wrapped M tokens backing USDnr.",
    ethereum: {
        tvl: sumTokensExport({
            owners: [USDnr],
            tokens: [mToken],
        }),
    },
    fluent: {
      tvl: sumTokensExport({
        owners: [USDnr],
        tokens: [mToken],
      })
    }
}
