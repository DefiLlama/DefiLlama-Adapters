const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
    arbitrum: {
        tvl: sumTokensExport({ 
          owner: '0x25f5967B0FB3182d7fcacef3b53E1B2517a31dAf',
          tokens: [ '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' ],
        }),
    }
};
