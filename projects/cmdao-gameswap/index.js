const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unknownTokens');

module.exports = {
    jbc: {
        tvl: sumTokensExport({ 
          owner: '0x280608DD7712a5675041b95d0000B9089903B569',
          tokens: [ADDRESSES.jbc.JUSDT],
        }),
    }
};
