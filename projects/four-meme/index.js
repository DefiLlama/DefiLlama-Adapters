const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
    bsc: {
        owners: Object.values({
            tokenManager: "0xEC4549caDcE5DA21Df6E6422d448034B5233bFbC",
            tokenManager2: "0x5c952063c7fc8610FFDB798152D69F0B9550762b",
        }),
        tokens: [ADDRESSES.null, ADDRESSES.bsc.USDT,],
    },
};

Object.keys(config).forEach(chain => {
    module.exports[chain] = { tvl: sumTokensExport(config[chain]) }
})