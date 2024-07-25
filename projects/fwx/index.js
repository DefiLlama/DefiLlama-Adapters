const axios = require("axios");

async function getTVL() {
  const { data } = await axios.get(
    "https://app.fwx.finance/api/v2/traction?chain_id=43114"
  );

  const divisor = BigInt(1e18);
  const number = BigInt(data.total_value_locked);
  const integerPart = number / divisor;
  const fractionalPart = number % divisor;
  const fractionalString = fractionalPart.toString().padStart(18, "0");

  return { usd: `${integerPart}.${fractionalString}` };
}

module.exports = {
  avax: {
    tvl: getTVL,
  },
};