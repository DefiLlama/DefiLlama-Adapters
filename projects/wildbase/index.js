const { sumTokensExport } = require("../helper/unknownTokens");

const masterchefAddress = "0x3eAB0C9716b0aA98CdC4c3ae317d69dE301ef247";
const wildxToken = "0xbCDa0bD6Cd83558DFb0EeC9153eD9C9cfa87782E";
const wildx_weth_lp = "0xeAA13b4f85A98E6CcaF65606361BD590e98DE2Cb"

module.exports = {
    misrepresentedTokens: true,
    bsc: {
        tvl: sumTokensExport({ tokens: [wildxToken, wildx_weth_lp], owner: masterchefAddress, useDefaultCoreAssets: true })
    },
    methodology: `Total amount of tokens in treasury and masterchef contract`,
};