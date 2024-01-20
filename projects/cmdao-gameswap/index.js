const { sumTokensExport } = require('../helper/unknownTokens');

module.exports = {
    jbc: {
        tvl: sumTokensExport({ 
          owner: '0x280608DD7712a5675041b95d0000B9089903B569',
          tokens: ['0x24599b658b57f91E7643f4F154B16bcd2884f9ac'],
        }),
    }
};
