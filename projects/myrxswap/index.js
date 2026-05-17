const { get } = require("../helper/http");

// MyrxSwap — Uniswap V2 AMM on MyrxWallet Network (Chain 8472)
// Factory:  0x7E4A7CC7D9e4e416E7277F8309cC54cF5FD8AF2b
// Router:   0xE0eAb9309910f7e0E60Fc637aF50B38A4B34aD2B
// Explorer: https://explorer.myrxwallet.io

const TICKERS_URL = "https://command.myrxwallet.io/api/v1/dex/tickers";

async function tvl() {
  const tickers = await get(TICKERS_URL);
  let totalUsd = 0;
  for (const t of tickers) {
    totalUsd += parseFloat(t.liquidity_in_usd || "0");
  }
  // Express as tether so DeFiLlama prices at $1/unit
  return { tether: totalUsd };
}

module.exports = {
  myrxwallet: {
    tvl,
  },
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    "Sums USD liquidity across all MyrxSwap AMM pairs on MyrxWallet Network (Chain 8472). " +
    "MUSD is a USD-pegged stablecoin; WMRT price derived from WMRT/MUSD pool ratio. " +
    "WBTC is wrapped Bitcoin bridged to Chain 8472.",
};