const { sumTokensExport } = require("../helper/unknownTokens");

const masterchefAddress = "0x3eAB0C9716b0aA98CdC4c3ae317d69dE301ef247";
const wildxToken = "0xbCDa0bD6Cd83558DFb0EeC9153eD9C9cfa87782E";
const wildx_weth_lp = "0xeAA13b4f85A98E6CcaF65606361BD590e98DE2Cb"
const treasury = "0x576182b7a1b0bC67701ead28a087228c50Aa0982";

module.exports = {
    misrepresentedTokens: true,
    tvl: sumTokensExport({ tokens: [wildx_weth_lp], owner: masterchefAddress, useDefaultCoreAssets: true }),
    pool2: sumTokensExport({ tokens: [wildx_weth_lp], owner: masterchefAddress, useDefaultCoreAssets: true }),
    staking: sumTokensExport({ tokens: [wildxToken], owner: masterchefAddress, useDefaultCoreAssets: true, lps: [alyx_bsc_lp] }),
    methodology: `Total amount of tokens in masterchef contract`,
};