const axios = require("axios");

async function getTVL() {
  const { data } = await axios.get(
    "https://dapp.filliquid.io/rpc/getTVL"
  );

  const divisor = BigInt(1e18);
  const number = BigInt(data.tvl);
  const integerPart = number / divisor;
  const fractionalPart = number % divisor;
  const fractionalString = fractionalPart.toString().padStart(18, "0");

  return { usd: `${integerPart}.${fractionalString}` };
}

module.exports = {
  fig: {
    tvl: getTVL,
  },
};
