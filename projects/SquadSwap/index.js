const { stakings } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')
const masterchefV2Address = '0x2e881a10f682a3b2CBaaF8fc5A9a94E98D4879B4'; // SquadSwap's MasterChef V2 contract
const masterchefV3Address = '0x44eC8143EB368cAbB00c4EfF085AF276260202B5'; // SquadSwap's MasterChef V3 contract
const squadTokenAddress = '0x2d2567dec25c9795117228adc7fd58116d2e310c'; // SquadSwap token contract

module.exports = {
    methodology: "TVL is calculated from total liquidity of SquadSwap's active pools",
    bsc: {
        tvl: getUniTVL({
            factory: '0x1D9F43a6195054313ac1aE423B1f810f593b6ac1',
            useDefaultCoreAssets: true,
        }),
        staking: stakings([
            masterchefV2Address,
            masterchefV3Address,
        ], squadTokenAddress)
    }
};
