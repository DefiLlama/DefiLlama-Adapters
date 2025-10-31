const ADDRESSES = require('../helper/coreAssets.json')
const BigNumber = require("bignumber.js")
const { getConfig } = require('../helper/cache');

async function suiTvl(api) {
  const symbols = (await getConfig('dipcoin-perp/symbols', 'https://gray-api.dipcoin.io/api/perp-market-api/list'))?.data?.map(i => i.symbol)
  if (!Array.isArray(symbols) || symbols.length === 0) return;
  const volumes = await Promise.all(symbols.map(async (symbol) => {
    const ticker = await getConfig(`dipcoin-perp/symbol-volume-${symbol}`, `https://gray-api.dipcoin.io/api/perp-market-api/ticker?symbol=${symbol}`);
    const volumeValue = ticker?.data?.volume24h || 0;
    
    return BigNumber(volumeValue);
  }));
  const sum = volumes.reduce((acc, volume) => acc.plus(volume), BigNumber(0)).div(1e12).toFixed(0);

  api.add(ADDRESSES.sui.USDC, sum);
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
