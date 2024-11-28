const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const sui = require("../helper/chain/sui");

const SUI_BANK_ID =
  "0x39c65abefaee0a18ffa0e059a0074fcc9910216fa1a3550aa32c2e0ec1c03043";

async function suiTvl(api) {
  const object = await sui.getObject(SUI_BANK_ID);

  // div by 1e6 as usdc coin has 6 precision
  const tvl = object.fields.coinBalance;
  api.add(ADDRESSES.sui.USDC, tvl);
  return api.getBalances()
}

module.exports = {
  sui: {
    tvl: suiTvl
  },
  hallmarks: [
    [Math.floor(new Date('2023-12-22')/1e3), 'Decomission Arbitrum support'],
  ],
}