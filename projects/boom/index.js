const axios = require("axios");

const BOOM_BROKER_ID = "boom";
const ORDERLY_API_URL = `https://api.orderly.org/v1/public/balance/stats?broker_id=${BOOM_BROKER_ID}`;

async function fetchTVL() {
  try {
    const response = await axios.get(ORDERLY_API_URL);
    const data = response.data.data;

    if (!data) {
      throw new Error("Invalid API response: Missing data field");
    }

    // Calculate TVL
    const tvl = data.total_holding + data.total_unsettled_balance;

    return {
      sonic: tvl, // Assigning TVL to Sonic blockchain
    };
  } catch (error) {
    console.error("Error fetching TVL:", error.message);
    return {};
  }
}

module.exports = {
  timetravel: false, // No historical data required
  misrepresentedTokens: false,
  methodology: "TVL is fetched from Orderly API and includes total holdings + unsettled balance.",
  fetch: fetchTVL,
}; 