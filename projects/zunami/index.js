const ADDRESSES = require('../helper/coreAssets.json')
const { fetchURL } = require("../helper/utils");

const usdt = ADDRESSES.ethereum.USDT;
const infoUrl = 'https://api.zunami.io/api/v2/zunami/info';

async function ethTvl() {
  const info = (await fetchURL(infoUrl)).data
  const totalHoldings = info.tvl * (10 ** 6)

  return {
    [usdt]: totalHoldings,
  };
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology: "Total value of digital assets that are locked in Zunami Omnipools",
};
