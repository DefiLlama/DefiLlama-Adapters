const { fetchURL } = require("../../utils");

const getBinancePrice = async (symbol) => {
  const response = await fetchURL(
    `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
  );
  return response?.data?.price;
};

module.exports = {
  getBinancePrice,
};
