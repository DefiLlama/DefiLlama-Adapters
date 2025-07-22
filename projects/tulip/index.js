const { staking } = require('../helper/staking');
const { getUniTVL } = require('../helper/unknownTokens')

const petal = "0x2736643C7fFFe186984f60a2d34b91b1b7398bF1";
const garden = "0xceF2f95f185D49bcd1c10DE7f23BEaCBaae6eD0f";

module.exports = {
    oasis: {
        staking: staking(garden, petal),
        tvl: getUniTVL({ factory: '0x90a5e676EFBdeFeeeb015cd87484B712fd54C96A', useDefaultCoreAssets: true }),
    }
};
