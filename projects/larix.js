const sdk = require("@defillama/sdk");
const { fetchURL } = require("./helper/utils");

const coingeckoMap = {
  USDT: 'tether',
  USDC: 'usd-coin',
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  mSOL: 'solana',
  soFTT: 'ftx-token',
  SRM: 'serum',
  RAY: 'raydium',
  weWETH: 'ethereum',
  stSOL: 'solana',
  FTT: 'ftx-token',
  UST: 'terrausd',
  scnSOL: 'solana',
  JSOL: 'solana',
  FIDA: 'bonfida'
};

async function getTokenPrices() {
  const allApiIds = Object.values(coingeckoMap);
  const allTokens = allApiIds
    .filter((a,b) => a.indexOf(allApiIds) == a.lastIndexOf(b))
    .reduce((a, b) => a + '%2C' + b);
  
    const prices = (await fetchURL(
    `https://api.coingecko.com/api/v3/simple/price?ids=${allTokens}&vs_currencies=usd`
    )).data;
  
  return prices;
};

function tvl(borrowed) {
  return async () => {
    const balances = {};
    const markets = (await fetchURL('https://api.projectlarix.com/market')).data.detail;
    const tokenPrices = await getTokenPrices();

    const tokens = markets.filter(a => !a.mint_name.includes('-')).map(m => ({
      token: coingeckoMap[m.mint_name],
      usdValue: (borrowed ? m.borrow_value : m.available_value)
    }));
    for (let market of tokens) {
      const tokenQty = market.usdValue / tokenPrices[market.token].usd;
      sdk.util.sumSingleBalance(balances, market.token, tokenQty);
    };

    const lps = markets.filter(a => a.mint_name.includes('-')).map(m => ({
      token1: coingeckoMap[m.mint_name.substring(0, m.mint_name.indexOf('-'))],
      token2: coingeckoMap[m.mint_name.substring(m.mint_name.indexOf('-') + 1)],
      usdValue: (borrowed ? m.borrow_value : m.available_value)
    }));
    for (let market of lps) {
      const token1Qty = market.usdValue / (2 * tokenPrices[market.token1].usd);
      const token2Qty = market.usdValue / (2 * tokenPrices[market.token2].usd);
      sdk.util.sumSingleBalance(balances, market.token1, token1Qty);
      sdk.util.sumSingleBalance(balances, market.token2, token2Qty);
    };

    return balances;
  };
};

module.exports = {
  timetravel: false,
  solana: {
    tvl: tvl(),
    borrowed: tvl(true)
  }
}; // node test.js projects/larix.js 