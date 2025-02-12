const { uniTvlExport } = require("./helper/calculateUniTvl")

module.exports = {
    heco: {
        tvl: uniTvlExport('0x13D1EA691C8153F5bc9a491d41b927E2baF8A6b1', "heco", true)
    }
}

module.exports.deadFrom = '2025-01-15'  // Heco chain is retired