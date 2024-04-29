const { sumTokensExport } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

module.exports = {
    mantle: {
        staking: staking("0xBeCd6b3D8B06479c83533f0d7E6DF1b0e413AeEa", "0x26a6b0dcdCfb981362aFA56D581e4A7dBA3Be140"),
        tvl: sumTokensExport({
            tokensAndOwners: [
                ["0xcDA86A272531e8640cD7F1a92c01839911B90bb0", "0x0CC41C11878254aF8E65ca61C03DD03735F2DC6d"]
            ]
        }),
    },
};
