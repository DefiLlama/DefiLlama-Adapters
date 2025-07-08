// adapter.js
const { get } = require('./helper/http');

async function tvl() {
  const data = await get(
    'https://flamingo-us-1.b-cdn.net/flamingo/analytics/daily-latest/tvl_data'
  );
  const { pool_usd, flund_usd, lend_usd } = data.tvl_data;

  // Parse strings to floats and sum them
  const totalUsd =
    parseFloat(pool_usd) +
    parseFloat(flund_usd) +
    parseFloat(lend_usd);

  return { tether: totalUsd };
}

module.exports = {
  hallmarks: [
    [1638525600, "N3 migration start"],
    [1641117600, "100% minting on N3"],
    [1641808800, "First IDO"],
    [1648116000, "First reverse pool"],
    [1650276000, "Binance N3 support"],
    [1651140000, "FLUND single stake"],
    [1654085699, "Advanced Trade launched"],
    [1656410400, "Mobile App"],
    [1656677699, "Fiat Onramper launched"],
    [1660047299, "First limit order trades on OrderBook+"],
    [1668428099, "Wave 1 of new liquidity pools"],
    [1671192899, "Wave 2 of new liquidity pools"],
    [1673352899, "USD Stablecoin FUSD & Flamingo Lend"],
    [1676463299, "FUSD Pool Bonus released"],
    [1682424899, "New landing and Get Started pages"],
    [1685621699, "Flamingo Ambassador Program launched"],
    [1687263299, "Expands to 14 EVM chains"],
    [1695644099, "Flamingo Finance 3.0"],
    [1705580099, "New roadmap announced"],
    [1712232899, "Dashboard-athon"],
    [1727093699, "Wave 3 of new liquidity pools"],
    [1734524099, "OrderBook+ 2.0 live on Testnet"],
    [1741263299, "OrderBook+ 2.0 live on Mainnet"],
    [1742904899, "FLOCKS released"]
  ],
  methodology: `TVL is obtained by making calls to the Flamingo Finance API "https://flamingo-us-1.b-cdn.net/flamingo/analytics/daily-latest/tvl_data".`,
  misrepresentedTokens: true,
  timetravel: false,
  neo: {
    tvl
  }
};
