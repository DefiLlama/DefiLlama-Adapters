const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { stakings } = require('../helper/staking')

module.exports = {
    mantle: {
        staking: stakings(
            ["0xBeCd6b3D8B06479c83533f0d7E6DF1b0e413AeEa", "0x1260140fEa31cf920D7D890aD1de85cbAC1Fea12", "0x35Ee9e36804d358A2892FA0De336426cC3Cb18e4"],
            "0x26a6b0dcdCfb981362aFA56D581e4A7dBA3Be140"),
        tvl: sumTokensExport({
            tokens: [ADDRESSES.mantle.mETH],
            owners: ["0x0CC41C11878254aF8E65ca61C03DD03735F2DC6d", "0x1260140fEa31cf920D7D890aD1de85cbAC1Fea12", "0x35Ee9e36804d358A2892FA0De336426cC3Cb18e4"]
        }),
    },
};
