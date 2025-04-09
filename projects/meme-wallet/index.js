const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unknownTokens");

const MEME_FACTORY_CONTRACT_ADDRESS = "0xda601604ecd1cb5f12e4522f1138d5419daf0ee0";
const WLD_CONTRACT_ADDRESS = ADDRESSES.wc.WLD;

module.exports = {
    methodology: "counts the TVL of tokens created by meme factory",
    start: '2024-12-10',
    wc: {
        tvl: sumTokensExport({ owner: MEME_FACTORY_CONTRACT_ADDRESS, tokens: [WLD_CONTRACT_ADDRESS] }),
    },
};