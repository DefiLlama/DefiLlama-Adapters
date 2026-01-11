const { sumTokens2 } = require('../helper/unwrapLPs');
const { fetchURL } = require('../helper/utils');

const BASE_URL = 'https://mainnet-dapp1.sunube.net:7740/query';
const BLOCKCHAIN_RID = 'F4E33267A8FF1ACCE3C6D7B441B8542FB84FF6DAA5114105563D2AA34979BEF6';

function buildQueryUrl(queryType, params = {}) {
  const url = `${BASE_URL}/${BLOCKCHAIN_RID}?type=${queryType}`;
  const queryParams = new URLSearchParams(params).toString();
  return queryParams ? `${url}&${queryParams}` : url;
}

async function tvl(api, isBorrows) {
  const { data } = await fetchURL(
    buildQueryUrl('get_stats_supply_deposit')
  );


  data.forEach(({ asset_id, total_borrow, total_deposit }) => {
    const balance = isBorrows ? total_borrow : total_deposit - total_borrow;
    api.add(asset_id, balance);
  });

  return sumTokens2({ api });
}

module.exports = {
  timetravel: false,
  chromia: {
    tvl: (api) => tvl(api, false),
    borrowed: (api) => tvl(api, true),
  },
}