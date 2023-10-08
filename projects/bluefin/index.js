const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const sui = require("../helper/chain/sui");

const SUI_BANK_ID =
  "0x5843d63df15cb98b1e1da7951d49bc6cb7fd1728317dc16b54f05b7e43faf912";

const Arbitrum_Config = {
  "endpoint": "0x52b5471d04487fb85B39e3Ae47307f115fe8733F",
}

async function suiTvl() {
  const { api } = arguments[3];
  const object = await sui.getObject(SUI_BANK_ID);

  // div by 1e6 as usdc coin has 6 precision
  const tvl = object.fields.coinBalance;
  api.add(ADDRESSES.sui.USDC, tvl);
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