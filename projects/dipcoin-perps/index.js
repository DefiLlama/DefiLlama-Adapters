const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");

const SUI_BANK_ID =
  "0x3cc2bfbe6b9dc346f3f27a47b4b0c9eaaf0143c0c704726a1513a1e8c5d9a4c1";

async function suiTvl(api) {
  const object = await sui.getObject(SUI_BANK_ID);
  const usdcAmount = object.fields.coin_balance;

  // div by 1e6 as usdc coin has 6 precision
  api.add(ADDRESSES.sui.USDC, usdcAmount);
}

module.exports = {
  sui: {
    tvl: suiTvl
  },
  hallmarks: [
    ['2025-10-15', "Launched the Perpetual Mainnet (v1.0)."],
    ['2025-10-16', "Listed perpetual contracts for BTC, ETH, and SUI."],
    ['2025-10-29', "Upgraded to Mainnet v1.1, introducing Take Profit/Stop Loss and margin management features."],
    ['2025-10-31', "Listed perpetual contracts for SOL, BNB, and XRP."],
  ],
}
