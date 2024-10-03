const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require('../helper/coreAssets.json')

const coffinScAddr = "EQBozwKVDya9IL3Kw4mR5AQph4yo15EuMdyX8nLljeaUxrpM"

module.exports = {
    methodology: 'Counts Coffin.Meme smartcontract TON & jettons balance as TVL.',
    ton: {
        tvl: sumTokensExport({ owner: coffinScAddr, tokens: [ADDRESSES.null], }),
    }
}