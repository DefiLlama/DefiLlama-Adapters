const { get } = require('./helper/http');

const ENDPOINT = 'https://api.noble.xyz/noble/dollar/vaults/v1/stats';

async function tvl() {
  const data = await get(ENDPOINT);
  const usdnAmount = Number(data.staked_total_principal) / 1e6;
  return { 'noble-dollar-usdn': usdnAmount };
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the total USDN deposited in the Noble points vault.',
  noble: {
    tvl,
  },
};

