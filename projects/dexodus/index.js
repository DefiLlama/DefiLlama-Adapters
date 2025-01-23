const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  methodology: 'Counts the USDC and WETH tokens in the Dexodus liquidity pool on Base.',
  base: {
    tvl: sumTokensExport({
      owners: [      '0x1A84d7E27e7f0e93Da74b93095e342b6e8dBd50A', // Dexodus liquidity pool address
        '0x39016479A05626Df9BA4cB80864E1B3b69D694b4', // Dexodus core futures address
        '0x1692992ee7EE987510Dd32BFCeF2C08C8080d5b2'  // Dexodus referrals address

      ], tokens: [ADDRESSES.base.USDbC, ADDRESSES.base.WETH]
    }),
  },
};
