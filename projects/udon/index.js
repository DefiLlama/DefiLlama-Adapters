const { sumTokens2 } = require('../helper/unwrapLPs');
const { fetchURL } = require('../helper/utils');

const BASE_URL = 'https://mainnet-dapp1.sunube.net:7740/query';
const BLOCKCHAIN_RID = 'F4E33267A8FF1ACCE3C6D7B441B8542FB84FF6DAA5114105563D2AA34979BEF6';
const STCHR_ASSET_ID = '56A3ADCFF347A2D52972C390928966733E72D2189B018CB284D8C99098C6B00F';
const STCHR_DECIMALS = 6;

function buildQueryUrl(queryType, params = {}) {
  const url = `${BASE_URL}/${BLOCKCHAIN_RID}?type=${queryType}`;
  const queryParams = new URLSearchParams(params).toString();
  return queryParams ? `${url}&${queryParams}` : url;
}

async function tvl(api, isBorrows) {
  const { data } = await fetchURL(
    buildQueryUrl('get_stats_supply_deposit')
  );

  console.log("data", data);

  data.forEach(({ asset_id, total_borrow, total_deposit }) => {
    const balance = isBorrows ? total_borrow : total_deposit - total_borrow;
    api.add(asset_id, balance);
  });

  return sumTokens2({ api });
}

async function staking(api) {
  const { data: totalStakeRaw } = await fetchURL(
    buildQueryUrl('get_total_stake_all_users')
  );

  const { data: price } = await fetchURL(
    buildQueryUrl('get_latest_price_by_asset_id', { asset_id: STCHR_ASSET_ID })
  );

  const totalStake = Number(totalStakeRaw) / 10 ** STCHR_DECIMALS;
  const tvlUsd = totalStake * price;

  api.addUSDValue(tvlUsd);
  return api.getBalances();
}

module.exports = {
  timetravel: false,
  chromia: {
    tvl: (api) => tvl(api, false),
    borrowed: (api) => tvl(api, true),
    staking: (api) => staking(api),
  },
}