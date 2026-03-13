// adapter.js
const { get } = require('./helper/http');

async function tvl() {
  const data = await get(
    'https://flamingo-us-1.b-cdn.net/flamingo/analytics/daily-latest/tvl_data'
  );
  const { pool_usd, flund_usd, lend_usd } = data.tvl_data;

  // Parse strings to floats and sum them
  // const totalUsd =
  //   parseFloat(pool_usd) 
    // parseFloat(flund_usd) +  // FLUND is backed by platforms own token: https://medium.com/flamingo-finance/flamingo-finance-announces-flamingo-flund-single-stake-9be434d0999d
    // parseFloat(lend_usd); // will be tracked under a new listing

  return { tether: +pool_usd };
}

module.exports = {
  hallmarks: [
    ['2021-12-03', "N3 migration start"],
    ['2022-01-02', "100% minting on N3"],
    ['2022-01-10', "First IDO"],
    //['2022-03-24', "First reverse pool"],
    // ['2022-04-18', "Binance N3 support"],
    // ['2022-04-28', "FLUND single stake"],
    ['2022-06-01', "Advanced Trade launched"],
    ['2022-06-28', "Mobile App"],
    ['2022-07-01', "Fiat Onramper launched"],
    //['2022-08-09', "First limit order trades on OrderBook+"],
    // ['2022-11-14', "Wave 1 of new liquidity pools"],
    // ['2022-12-16', "Wave 2 of new liquidity pools"],
    // ['2023-01-10', "USD Stablecoin FUSD & Flamingo Lend"],
    // ['2023-02-15', "FUSD Pool Bonus released"],
    // ['2023-04-25', "New landing and Get Started pages"],
    // ['2023-06-01', "Flamingo Ambassador Program launched"],
    // ['2023-06-20', "Expands to 14 EVM chains"],
    //['2023-09-25', "Flamingo Finance 3.0"],
   // ['2024-01-18', "New roadmap announced"],
    // ['2024-04-04', "Dashboard-athon"],
     ['2024-09-23', "Wave 3 of new liquidity pools"],
    // ['2024-12-18', "OrderBook+ 2.0 live on Testnet"],
    // ['2025-03-06', "OrderBook+ 2.0 live on Mainnet"],
    // ['2025-03-25', "FLOCKS released"]
  ],
  methodology: `TVL is obtained by making calls to the Flamingo Finance API "https://flamingo-us-1.b-cdn.net/flamingo/analytics/daily-latest/tvl_data".`,
  misrepresentedTokens: true,
  timetravel: false,
  neo: {
    tvl
  }
};
