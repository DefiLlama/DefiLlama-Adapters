const { fetchURL } = require("../helper/utils");

const coingeckoMap = {
  WETH: "weth",
  UNIW: "unia-farms",
};

async function getTokenPrice(token) {
  const id = coingeckoMap[token];
  if (!id) {
    throw new Error(`Id not available for token: ${token}`);
  }

  const prices = (
    await fetchURL(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
    )
  ).data;

  return prices[id].usd;
}

module.exports = getTokenPrice;
