const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances');

const baseUrl = "https://api-v1.verocket.com";
const tvlApy = `${baseUrl}/dex/overall/lp_volume`
const vetPrice = `${baseUrl}/price/vet`


const getVetPrice = async () => {
  return (await get(vetPrice)).data.usd
}

async function tvl() {
  balances = 0;
  const response = (await get(tvlApy)).data;

  // get vet price
  const vetPrice = await getVetPrice();

  // fetch latest TVL from the list of 30 days TVL
  tvlObjects = response[29].items;

  tvlObjects.forEach(el => {
    balances += el.eq_vet * vetPrice;
  });

  return toUSDTBalances(balances)
}

tvl()

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  vechain: {
    tvl: tvl,
  }
};