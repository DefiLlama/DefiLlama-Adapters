const axios = require("axios");

const BOOM_BROKER_ID = "boom";
const ORDERLY_API_URL = `https://api.orderly.org/v1/public/balance/stats?broker_id=${BOOM_BROKER_ID}`;

async function fetchTVL() {
  try {
    const response = await axios.get(ORDERLY_API_URL);
    const data = response.data.data;

    if (!data) {
      console.error("Invalid API response: Missing data field");
      return 0;
    }

    // Ensure values are numbers and default to 0 if undefined or not a number
    const totalHolding = parseFloat(data.total_holding) || 0;
    const totalUnsettledBalance = parseFloat(data.total_unsettled_balance) || 0;

    // Calculate TVL
    const tvl = totalHolding + totalUnsettledBalance;

    // Ensure the result is a valid number
    if (isNaN(tvl) || !isFinite(tvl)) {
      console.error("TVL calculation resulted in NaN or Infinity");
      return 0;
    }

    return tvl;
  } catch (error) {
    console.error("Error fetching TVL:", error.message);
    return 0;
  }
}

// This is a wrapper function that will be used for the top-level TVL
async function fetchTotalTVL() {
  return fetchTVL();
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "TVL is fetched from Orderly API and includes total holdings + unsettled balance.",
  sonic: {
    tvl: fetchTVL
  },
  tvl: fetchTotalTVL
}; 