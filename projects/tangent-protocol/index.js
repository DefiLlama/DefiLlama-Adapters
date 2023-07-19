const axios = require('axios');

async function tvl(_, _1, _2, { api }) {
  
  const TANG_TOKEN_CONTRACT = 'bf9354cba4ee83c5de05c72830c6430967a26a1656b06293541d23e1';

  const ethPriceResponse = await axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=tangent&vs_currencies=USD'
  );
  const tangPrice = ethPriceResponse.data?.tangent?.usd;

  const cPiggyPriceResponse = await axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=cpiggy-bank-token&vs_currencies=USD'
  );
  const cPiggyPrice = cPiggyPriceResponse.data['cpiggy-bank-token']?.usd;

  const totalPoolStakedTokens = await axios.get(
    'https://tangent-staking-mainnet.herokuapp.com/pool/getPoolsStakedTokens'
  );
  const { poolsStakedTokens: stakedTokens } = totalPoolStakedTokens.data;

  let totalLockVal = 0;
  if (stakedTokens) {
    totalLockVal =
      (stakedTokens[1] / 1000000) * tangPrice +
      (stakedTokens[3] / 100) * 0.00003 +
      stakedTokens[41] * 0.030568 +
      stakedTokens[2] * 0.000022 * tangPrice +
      (stakedTokens[40] / 100) * cPiggyPrice;

    for (const key of Object.keys(stakedTokens)) {
      if (key < 4 || key == 40 || key == 41) continue;
      totalLockVal += stakedTokens[key] * 186;
    }
  }

  api.add(TANG_TOKEN_CONTRACT, totalLockVal);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Calculate the total value locked (TVL) of Tangent Protocol in both the liquidity and NFT farming areas.',
  start: 1000235,
  bsc: {
    tvl,
  },
};