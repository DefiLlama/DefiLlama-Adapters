const sui = require("../helper/chain/sui");
const { getConfig } = require('../helper/cache');

async function suiTvl(api) {
  const tvl = (await getConfig('dipcoin/perps-tvl', 'https://api.dipcoin.io/api/perp-market-api/tvl'))?.data?.tvl;
  api.add(ADDRESSES.sui.USDC, tvl/1e12);
}


module.exports = {
  hallmarks: [
    ['2025-10-15', "Launched the Perpetual Mainnet (v1.0)."],
    ['2025-10-16', "Listed perpetual contracts for BTC, ETH, and SUI."],
    ['2025-10-29', "Upgraded to Mainnet v1.1, introducing Take Profit/Stop Loss and margin management features."],
    ['2025-10-31', "Listed perpetual contracts for SOL, BNB, and XRP."],
  ],
  sui: {
    tvl: suiTvl
  },
}

