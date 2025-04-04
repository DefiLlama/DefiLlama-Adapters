const axios = require("axios");

const BOOM_BROKER_ID = "boom";
const ORDERLY_API_URL = `https://api.orderly.org/v1/public/balance/stats?broker_id=${BOOM_BROKER_ID}`;

async function fetchTVL() {
  try {
    console.log(`Fetching data from: ${ORDERLY_API_URL}`);
    const response = await axios.get(ORDERLY_API_URL);
    console.log(`API Response status: ${response.status}`);
    console.log(`API Response data: ${JSON.stringify(response.data)}`);

    const data = response.data.data;

    if (!data) {
      console.error("Invalid API response: Missing data field");
      return 0;
    }

    // Ensure values are numbers and default to 0 if undefined or not a number
    const totalHolding = parseFloat(data.total_holding) || 0;
    const totalUnsettledBalance = parseFloat(data.total_unsettled_balance) || 0;

    console.log(`Total holding: ${totalHolding}`);
    console.log(`Total unsettled balance: ${totalUnsettledBalance}`);

    // Calculate TVL
    const tvl = totalHolding + totalUnsettledBalance;
    console.log(`Calculated TVL: ${tvl}`);

    // Ensure the result is a valid number
    if (isNaN(tvl) || !isFinite(tvl)) {
      console.error("TVL calculation resulted in NaN or Infinity");
      return 0;
    }

    return tvl;
  } catch (error) {
    console.error(`Error fetching TVL: ${error.message}`);
    if (error.response) {
      console.error(`Error response data: ${JSON.stringify(error.response.data)}`);
    }
    return 0;
  }
}

// Export in the format expected by DefiLlama
module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "TVL is fetched from Orderly API and includes total holdings + unsettled balance.",
  start: 1700000000, // Approximate timestamp for when the project launched
  sonic: { tvl: fetchTVL }
};
