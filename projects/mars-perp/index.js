
const fetchURL = require("../../utils/fetchURL");
const { queryContract } = require('../helper/chain/cosmos');
const BigNumber = require('bignumber.js');
const axios = require('axios');

const contractAddresses = {
  neutron: {
    perps: 'neutron1g3catxyv0fk8zzsra2mjc0v4s69a7xygdjt85t54l7ym3gv0un4q2xhaf6'
  },
};



async function tvl(api) {
  const chain = api.chain;
  const { perps } = contractAddresses[chain];
  const info = await queryContract({ contract: perps, chain, data: { 'config': {} }, });
  const perpsVault = await queryContract({ contract: perps, chain, data: { 'vault': {} }, });

  if (perpsVault) api.add(info.base_denom, perpsVault['total_balance']);
}

async function fetch(timestamp) {
const perpsInfoApi = `https://backend.prod.mars-dev.net/v2/perps_overview?chain=neutron&days=2&response_type=global`
const { global_overview } = (
  await fetchURL(perpsInfoApi)
);  


  let last24HourVolume = 0
  let fetchTimestamp = timestamp
  // The second element in the array is the last 24 hour volume, while the first element is the current volume of the ongoing day
  if(global_overview && global_overview.daily_trading_volume.length > 1) {
    // Volume is returned in uusd which has 6 decimals
    last24HourVolume = new BigNumber(global_overview.daily_trading_volume[1].value).shiftedBy(-6)
    fetchTimestamp = Math.round(new Date(global_overview.daily_trading_volume[1].date).getTime()/1000)
  }

  return {
    last24HourVolume,
    timestamp: fetchTimestamp,
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "For each chain, sum token balances by querying the total deposit amount for each asset in the chain's params contract.",
  neutron: { tvl, fetch },
}
