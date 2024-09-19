const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require("../helper/unwrapLPs");

const config = {
    bsc: {
        owners: Object.values({
            tokenManager: "0xEC4549caDcE5DA21Df6E6422d448034B5233bFbC",
            tokenManager2: "0x5c952063c7fc8610FFDB798152D69F0B9550762b",
        }),
        tokens: [ADDRESSES.null, ADDRESSES.bsc.USDT,
            '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
            '0x9eC02756A559700d8D9e79ECe56809f7bcC5dC27',
            '0x5b1f874d0b0C5ee17a495CbB70AB8bf64107A3BD'],
    },
};

Object.keys(config).forEach(chain => {
    module.exports[chain] = { tvl: sumTokensExport(config[chain]) }
})