const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const sui = require("../helper/chain/sui");

const SUI_BANK_ID =
  "0x39c65abefaee0a18ffa0e059a0074fcc9910216fa1a3550aa32c2e0ec1c03043";

const USDC_VAULT_ID = "0x10d48e112b92c8af207c1850225284a7ca46bac1d935c4af4cf87ce29b121694";

const Arbitrum_Config = {
  "endpoint": "0x52b5471d04487fb85B39e3Ae47307f115fe8733F",
}

async function suiTvl(api) {
  const object = await sui.getObject(SUI_BANK_ID);
  const usdc_vault_object = await sui.getObject(USDC_VAULT_ID);
  const usdcAmount = object.fields.coinBalance;
  const vaultAmount = usdc_vault_object.fields.total_locked_amount;
  // div by 1e6 as usdc coin has 6 precision
  api.add(ADDRESSES.sui.USDC, usdcAmount-vaultAmount);
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
  hallmarks: [
    ['2023-12-22', 'Decomission Arbitrum support'],
  ],
}
