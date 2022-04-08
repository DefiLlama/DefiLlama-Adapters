const retry = require("./helper/retry");
const axios = require("axios");
async function tvl() {
  let balances = {};
  balances["blockstack"] = 0;
  balances["usd-coin"] = 0;

  let pools = (
    await retry(
      async (bail) =>
        await axios.get("https://api-finance.cryptomate.me/tokens/mainnet/pools")
    )
  ).data.pools;

  const tokensPrice = (
    await retry(
      async (bail) =>
        await axios.get("https://api-finance.cryptomate.me/tokens/mainnet/price")
    )
  ).data;

  const tokensMetadata = (
    await retry(
      async (bail) =>
        await axios.get("https://api-finance.cryptomate.me/tokens/mainnet/metadata")
    )
  ).data.metadata;
  pools = pools.filter(pool =>{

    return tokensMetadata[pool.x_token.split(".")[1]].name in tokensPrice
                              || tokensMetadata[pool.y_token.split(".")[1]].name in tokensPrice;
  })

  pools.map(pool => {
    const [tvlFt1,
           ft1Name,
           ft1Decimals,
           tvlFt2,
           ft2Name,
           ft2Decimals] = tokensMetadata[pool.x_token.split(".")[1]].name in tokensPrice
      ? [pool.tvl_x_token,
        tokensMetadata[pool.x_token.split(".")[1]].name,
        Math.pow(10, tokensMetadata[pool.x_token.split(".")[1]].decimals),
        pool.tvl_y_token,
        tokensMetadata[pool.y_token.split(".")[1]].name,
        Math.pow(10, tokensMetadata[pool.y_token.split(".")[1]].decimals)]
      : [pool.tvl_y_token,
        tokensMetadata[pool.y_token.split(".")[1]].name,
        Math.pow(10, tokensMetadata[pool.y_token.split(".")[1]].decimals),
        pool.tvl_x_token,
        tokensMetadata[pool.x_token.split(".")[1]].name,
        Math.pow(10, tokensMetadata[pool.x_token.split(".")[1]].decimals)];
    const token_type = ft1Name === "wrapped STX"? "blockstack": "usd-coin";
    balances[token_type] += ft1Name === "wrapped STX"? tvlFt1/ ft1Decimals: tokensPrice[ft1Name].price * tvlFt1/ft1Decimals;
    balances[token_type] += ft2Name === "wrapped STX"? tvlFt2/ ft2Decimals: tokensPrice[ft2Name].price * tvlFt2/ft2Decimals;
  })
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  stacks: {
    tvl,
  },
};