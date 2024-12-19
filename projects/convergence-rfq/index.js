const axios = require("axios")

const HEADERS = {
  "Content-Type": "application/json",
  "apikey": "indexer-key.855ed0656f1c31bb1dda57aa7bdc4354",
};

async function tvl() {
    // Fetch data from the API
    const { data: { tradingVolume } } = await axios.get(`https://mainnet.indexer.convergence.so/rfqs/trading-matrix`, {
      headers: HEADERS,
    });

    // Utility function to sum values safely
    const safeSum = (...values) => values.reduce(
      (sum, value) => (typeof value === 'number' && value > 0 ? sum + value : sum),
      0
    );

    // Sum up the values from the tradingVolume data
    const totalOverall = safeSum(
      tradingVolume?.spot?.overall || 0,
      tradingVolume?.options?.overall || 0,
      tradingVolume?.futures?.overall || 0
    );

    // Return the final total or zero if invalid
    return {
      "solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": totalOverall > 0 ? totalOverall * 10 ** 6 : 0
    };
}

module.exports = {
  methodology: "Convergence Rfq TVL",
  timetravel: false,
  solana: {
    tvl,
  }
}