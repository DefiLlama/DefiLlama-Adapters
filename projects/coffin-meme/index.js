const { sumTokensExport } = require("../helper/chain/ton");

const coffinScAddr = "EQBozwKVDya9IL3Kw4mR5AQph4yo15EuMdyX8nLljeaUxrpM"

module.exports = {
    methodology: 'Counts Coffin.Meme smartcontract TON & jettons balance as TVL.',
    ton: {
        tvl: sumTokensExport({ owner: coffinScAddr, onlyWhitelistedTokens: false}),
    }
}