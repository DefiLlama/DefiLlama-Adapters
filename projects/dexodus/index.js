const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  methodology: 'Counts the USDC and WETH tokens in the Dexodus liquidity pool on Base.',
  base: {
    tvl: sumTokensExport({ owner: '0x1A84d7E27e7f0e93Da74b93095e342b6e8dBd50A', tokens: [ADDRESSES.base.USDbC, ADDRESSES.base.WETH] }),
  },
};
