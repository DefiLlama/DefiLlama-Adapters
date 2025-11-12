const { get } = require('../helper/http')

async function tvl (api) {
    const res = await get("https://api.pixelswap.io/apis/tokens");

    res.data.tokens.forEach(({ address, tokenBalance }) => {
      if (!tokenBalance) return;
      api.addTokens(address, tokenBalance)
    })
  }

  module.exports = {
    ton: { tvl }
  };
