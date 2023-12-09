const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
    methodology: 'To get TVL we call the getAumInUsdl function from contract address: 0xf024541569796286d58fFF4b5898A3C3f1635bd1',
    linea: {
        tvl: sumTokensExport({ owner: '0xc5f444d25d5013c395f70398350d2969ef0f6aa0', tokens: [ADDRESSES.linea.USDC]}),
  },
};
