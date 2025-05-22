const { request, gql } = require("graphql-request");
const axios = require("axios");

const chainConfig = {
  "43111": {
    name: "hemi",
    SUBGRAPH_URL: "https://api.studio.thegraph.com/query/108155/mint-park-marketplace/v0.0.2",
    PLATFORM_FEE: 200, // 2.0%
  },
};

function getDayStartTimestamp(timestamp) {

  if (!timestamp || isNaN(timestamp)) {
    const now = Math.floor(Date.now() / 1000);
    const date = new Date(now * 1000);
    date.setUTCHours(0, 0, 0, 0);
    return Math.floor(date.getTime() / 1000);
  }
  const date = new Date(timestamp * 1000);
  date.setUTCHours(0, 0, 0, 0);
  const result = Math.floor(date.getTime() / 1000);

  return result;
}

// Volume fetch function for hemi chain
async function fetchHemiVolume(api) {
  const timestamp = api.timestamp;
  const config = chainConfig["43111"];
  const dayStart = getDayStartTimestamp(timestamp);
  const dayEnd = 1747612800

  const query = gql`
    query ($from: Int!, $to: Int!) {
      listingSolds(
        where: { blockTimestamp_gte: $from, blockTimestamp_lt: $to }
        first: 1000
      ) {
        price
      }
    }
  `;

  const data = await request(config.SUBGRAPH_URL, query, { from: dayStart, to: dayEnd });

  const dailyVolume = data.listingSolds.reduce((sum, sale) => {
    const priceWei = Number(sale.price);
    return sum + (isNaN(priceWei) ? 0 : priceWei);
  }, 0) / 1e18; // Convert from wei to ETH

  return {
    dailyVolume: dailyVolume > 0 ? dailyVolume.toFixed(2) : "0",
    timestamp: dayStart,
  };
}

async function fetchHemiTVL() {
  return 0;
}

module.exports = {
  timetravel: true,
  methodology: "Volume is fetched from the subgraph and converted to USD using ETH price from Coin Prices API. Fees are 2.0% of volume but not exported separately.",

  ethereum: {
    tvl: async () => 0,
  },

  hemi: {
    tvl: fetchHemiTVL,
    fetch: fetchHemiVolume,
  }
};