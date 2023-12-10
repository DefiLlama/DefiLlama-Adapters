const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
    methodology: 'USDC.e in the vault',
    linea: {
        tvl: sumTokensExport({ owner: '0xc5f444d25d5013c395f70398350d2969ef0f6aa0', tokens: [ADDRESSES.linea.USDC]}),
  },
};
