const { get } = require('./helper/http')

async function fetch() {
  return (await get('https://api.atrix.finance/api/tvl')).tvl;
}

module.exports = {
  timetravel: false,
  methodology: "The Atrix API endpoint fetches on-chain data from the Serum orderbook and token accounts for each liquidity pool, then uses prices from Coingecko to aggregate total TVL.",
  fetch,
  hallmarks: [
    [1665521360, "Mango Markets Hack"],
    [1667865600, "FTX collapse"]
  ],
};
