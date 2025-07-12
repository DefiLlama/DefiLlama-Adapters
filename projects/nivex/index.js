const axios = require("axios");

const endpoint = "https://api.nivex0.one/public/market/tickers";  // 示例 API，需替换成实际可用地址

async function fetch() {
  const response = await axios.get(endpoint);
  const data = response.data?.data || [];

  // 过滤出 USDT 对交易对，并计算总交易量
  const totalVolume = data
    .filter(ticker => ticker.symbol.endsWith("/USDT"))
    .reduce((sum, ticker) => {
      const volume = parseFloat(ticker.quoteVolume) || 0;
      return sum + volume;
    }, 0);

  return {
    volume: totalVolume,
    timestamp: Date.now() / 1000
  };
}

module.exports = {
  adapter: {
    fetch,
    runAtCurrTime: true,
    volume: {
      fetch,
    },
    start: async () => 1710000000  // Unix timestamp (2024-03-10)
  },
};
