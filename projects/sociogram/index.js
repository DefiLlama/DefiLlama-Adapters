const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
    arbitrum: {
        tvl: sumTokensExport({ 
          owner: '0x25f5967B0FB3182d7fcacef3b53E1B2517a31dAf',
          tokens: [ ADDRESSES.arbitrum.USDT ],
        }),
    }
};
