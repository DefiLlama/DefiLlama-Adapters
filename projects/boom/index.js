const axios = require("axios");

const BOOM_BROKER_ID = "boom";
const ORDERLY_API_URL = `https://api.orderly.org/v1/public/balance/stats?broker_id=${BOOM_BROKER_ID}`;

async function fetchTVL() {
  try {
    const response = await axios.get(ORDERLY_API_URL);
    const data = response.data.data;

    if (!data) {
      console.error("Invalid API response: Missing data field");
      return { sonic: 0 };
    }

    // Ensure values are numbers and default to 0 if undefined or not a number
    const totalHolding = parseFloat(data.total_holding) || 0;
    const totalUnsettledBalance = parseFloat(data.total_unsettled_balance) || 0;

    // Calculate TVL
    const tvl = totalHolding + totalUnsettledBalance;

    // Ensure the result is a valid number
    if (isNaN(tvl)) {
      console.error("TVL calculation resulted in NaN");
      return { sonic: 0 };
    }

    return {
      sonic: tvl
    };
  } catch (error) {
    console.error("Error fetching TVL:", error.message);
    return { sonic: 0 };
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "TVL is fetched from Orderly API and includes total holdings + unsettled balance.",
  fetch: fetchTVL
}; 