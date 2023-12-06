// @ts-check
const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const npm = {
    ethereum: "0x57f12fe6a4e5fe819eec699fadf9db2d06606bb4",
    arbitrum: "0x57f12fe6a4e5fe819eec699fadf9db2d06606bb4",
    bsc: "0x57f12fe6a4e5fe819eec699fadf9db2d06606bb4",
};

const usdc = {
    arbitrum: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
};

const treasury = {
    arbitrum: "0x808ca06eec8d8645386be4293a7f4428d4994f5b",
};


module.exports = treasuryExports({
    arbitrum: {
        tokens: [
            nullAddress,
            usdc.arbitrum,//Bridged USDC
            ADDRESSES.arbitrum.USDC_CIRCLE,//Circle USDC
            ADDRESSES.arbitrum.DAI,//DAI
            ADDRESSES.arbitrum.WETH,//WETH
            ADDRESSES.arbitrum.USDT,//USDT
        ],
        owners: [treasury.arbitrum],
        ownTokens: [npm.arbitrum],
        resolveLP: true,
        resolveUniV3: true,
    },
})