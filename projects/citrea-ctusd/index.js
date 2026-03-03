const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/sumTokens");

const ctUsd = ADDRESSES.citrea.CTUSD;
const mToken = "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b";

module.exports = {
    methodology: "TVL counts the total value of M tokens backing ctUSD.",
    citrea: {
        tvl: sumTokensExport({
            owners: [ctUsd],
            tokens: [mToken],
        }),
    }
}