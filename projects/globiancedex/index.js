const { post } = require('../helper/http')

async function fetch() {
  const response = await post("https://dexapi.globiance.com/get-stats")
  const tvl = response.data.tvl;
  return tvl;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `GlobianceDEX TVL is a sum of all the crypto assets locked in various liquidity pools & staking pools available on the DEX.`,
  fetch,
};
