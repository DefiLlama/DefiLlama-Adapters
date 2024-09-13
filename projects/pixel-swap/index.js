const { get } = require('../helper/http')

async function tvl(api) {
    const res = await get("https://api.pixelswap.io/apis/tokens");
    const tokens = res.data.tokens.map(i => i.address);
    const balances = res.data.tokens.map(i => i.tokenBalance);
  
    api.addTokens(tokens, balances);
  }

  module.exports = {
    ton: {
      tvl,
    }
  };
