const { sumTokensExport } = require("./helper/unwrapLPs");


module.exports = {
    kava: {
        tvl: sumTokensExport({ 
          chain: 'kava', 
          owner: '0xf7F000efe8aAeAD848ad0300bCa76FdA39644977', 
          tokens: [ '0xB61f8397714DF78a90fCF761923Cd60D7Afd950D','0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b'],
        }),
    }
};
