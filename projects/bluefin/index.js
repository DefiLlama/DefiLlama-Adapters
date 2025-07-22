const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const sui = require("../helper/chain/sui");

const SUI_BANK_ID =
  "0x39c65abefaee0a18ffa0e059a0074fcc9910216fa1a3550aa32c2e0ec1c03043";

const BLUE_VAULT_ID = "0xe567f041b313134fdd241c57cb10cfc5b54ca36cc91643308c34bbbafefd960a";
const BLUE_COIN = "0xe1b45a0e641b9955a20aa0ad1c1f4ad86aad8afb07296d4085e349a50e90bdca::blue::BLUE";

const Arbitrum_Config = {
  "endpoint": "0x52b5471d04487fb85B39e3Ae47307f115fe8733F",
}

async function suiTvl(api) {
  const object = await sui.getObject(SUI_BANK_ID);
  const usdcAmount = object.fields.coinBalance;
  // div by 1e6 as usdc coin has 6 precision
  api.add(ADDRESSES.sui.USDC, usdcAmount);
}

const staking = async (api) => {
  const vaultObject = await sui.getObject(BLUE_VAULT_ID);
  const blueCoinAmount = vaultObject.fields.total_locked_amount;
  // div by 1e9 as blue coin has 9 precision
  api.add(BLUE_COIN, blueCoinAmount);
}

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [Arbitrum_Config.endpoint],
      tokens: [ADDRESSES.arbitrum.USDC],
    })
  },
  sui: {
    tvl: suiTvl,
    staking
  },
  hallmarks: [
    ['2023-12-22', 'Decomission Arbitrum support'],
  ],
}
