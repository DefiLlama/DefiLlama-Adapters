const axios = require('axios');
async function fetchAvaxTVL() {
    const address = '0x0639556F03714A74a5fEEaF5736a4A64fF70D206';
    const rpcUrl = 'https://api.avax.network/ext/bc/C/rpc';
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getBalance",
      params: [address, "latest"]
    };
    const res = await axios.post(rpcUrl, body);
    const balanceWei = BigInt(res.data.result);
    const avax = Number(balanceWei) / 1e18;
    const priceRes = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=AVAXUSDT');
    const avaxPrice = priceRes.data.price;
    return avax * avaxPrice;
  }

module.exports = {
    avax: {
        tvl: async (api) =>
            await fetchAvaxTVL()
      },
  };
