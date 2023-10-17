const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const sui = require("../helper/chain/sui");

const SUI_BANK_ID =
  "0x39c65abefaee0a18ffa0e059a0074fcc9910216fa1a3550aa32c2e0ec1c03043";

const Arbitrum_Config = {
  "endpoint": "0x52b5471d04487fb85B39e3Ae47307f115fe8733F",
}

async function suiTvl() {
  const { api } = arguments[3];
  const object = await sui.getObject(SUI_BANK_ID);

  // div by 1e6 as usdc coin has 6 precision
  const tvl = object.fields.coinBalance;
  api.add(ADDRESSES.sui.USDC, tvl);
  return api.getBalances()
}

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [Arbitrum_Config.endpoint],
      tokens: [ADDRESSES.arbitrum.USDC],
    })
  },
  sui: {
    tvl: suiTvl
  },
}