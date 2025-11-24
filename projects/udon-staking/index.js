const { fetchURL } = require('../helper/utils');

const BASE_URL = 'https://mainnet-dapp1.sunube.net:7740/query';
const BLOCKCHAIN_RID = 'F4E33267A8FF1ACCE3C6D7B441B8542FB84FF6DAA5114105563D2AA34979BEF6';

function buildQueryUrl(queryType, params = {}) {
  const url = `${BASE_URL}/${BLOCKCHAIN_RID}?type=${queryType}`;
  const queryParams = new URLSearchParams(params).toString();
  return queryParams ? `${url}&${queryParams}` : url;
}

async function tvl(api) {
  const { data: totalStakeRaw } = await fetchURL(buildQueryUrl('get_total_stake_all_users'));

  api.add('5F16D1545A0881F971B164F1601CBBF51C29EFD0633B2730DA18C403C3B428B5', totalStakeRaw);
}

module.exports = {
  timetravel: false,
  chromia: {
    tvl
  },
}