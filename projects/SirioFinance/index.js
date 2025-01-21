const axios = require("axios");

const API_URL = "https://mainnet.service-api.sirio.finance/api/v1/markets/stats"; // Endpoint della tua API

async function tvl(api) {
    const response = await axios.get(API_URL);
    const markets = response.data.markets;

    for (let market of markets) {
    let tokenName = market.token.name;

      if(tokenName === "USDC") {
        tokenName = "usd-coin";
      }
      if(tokenName === "HBAR") {
        tokenName = "hedera-hashgraph";
      }
      if(tokenName === "PACK") {
        tokenName = "hashpack";
      }
      if(tokenName === "SAUCE") {
        tokenName = "saucerswap";
      }

      const decimal = market.token.decimal;
      const supplied = market.supplied / 10 ** (decimal);
      const borrowed = market.borrowed / 10 ** (decimal);

      const tokenValueUSD = (supplied + borrowed);
    
      api.addCGToken(tokenName, tokenValueUSD);
    }
    
}

module.exports = {
  methodology: "Sum of all supplied and borrowed tokens from API https://mainnet.service-api.sirio.finance/api/v1/markets/stats",
  timetravel: false,
  hedera: { tvl }
};