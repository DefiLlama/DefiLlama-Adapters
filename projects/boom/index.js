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

    // Ensure values are numbers and default to 0 if undefined or not a number
    const totalHolding = Number(data.total_holding) || 0;
    const totalUnsettledBalance = Number(data.total_unsettled_balance) || 0;

    // Calculate TVL
    const tvl = totalHolding + totalUnsettledBalance;

    // Verify that TVL is a valid number
    if (isNaN(tvl)) {
      console.error("Error: TVL calculation resulted in NaN", { 
        totalHolding, 
        totalUnsettledBalance, 
        originalData: data 
      });
      return { sonic: 0 }; // Return 0 as fallback
    }

    return {
      sonic: tvl, // Assigning TVL to Sonic blockchain
    };
  } catch (error) {
    console.error("Error fetching TVL:", error.message);
    return { sonic: 0 }; // Return 0 as fallback instead of empty object
  }
}

module.exports = {
  timetravel: false, // No historical data required
  misrepresentedTokens: false,
  methodology: "TVL is fetched from Orderly API and includes total holdings + unsettled balance.",
  fetch: fetchTVL,
}; 