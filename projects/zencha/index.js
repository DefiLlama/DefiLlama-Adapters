const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const swapFlashLoan = '0x2D027B49B8960810F84D5fE172d07FFf62311852';

module.exports = {
    boba: {
        tvl: sumTokensExport({ owner: swapFlashLoan, tokens: [ADDRESSES.boba.USDC, ADDRESSES.boba.USDT, ADDRESSES.boba.DAI] }),
    }
}