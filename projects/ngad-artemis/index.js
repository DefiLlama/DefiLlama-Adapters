const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
    metis: {
        tvl: sumTokensExport({
            owner: '0x96C4A48Abdf781e9c931cfA92EC0167Ba219ad8E',
            tokens: ['0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000']
        })
    }
};
