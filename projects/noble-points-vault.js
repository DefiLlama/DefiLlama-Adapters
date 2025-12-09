const { get } = require('../helper/http');

const ENDPOINT = 'https://api.noble.xyz/noble/dollar/vaults/v1/stats';

async function tvl() {
  const data = await get(ENDPOINT);
  const tvlUsd = Number(data.staked_total_principal) / 1e6;
  return { tether: tvlUsd };
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the total principal deposited in the Noble USDN points vault.',
  noble: {
    tvl,
  },
}
