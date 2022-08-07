const axios = require('axios');
const SPICY_URL = 'https://spicya.sdaotools.xyz/api/rest';

let _spicePools;

const fetchPoolsAndReduce = async (timeAgg) => {
  if (!_spicePools) _spicePools = axios(`${SPICY_URL}/PoolListAll?day_agg_start=${timeAgg.day_start}&hour_agg_start=${timeAgg.hour_start}`);
  const spicyPools = (await _spicePools).data.pair_info;

  return spicyPools.map(pool => pool.totalstakedfarmxtzlp).reduce((previous, current) => previous + current);
}

const calculateAgg = () => {
  let day_start = new Date();
  day_start.setDate(day_start.getDate() - 7);

  let hour_start = new Date();
  hour_start.setDate(hour_start.getDate() - 1);
  
  return { day_start: Math.floor(day_start.getTime() / 1000), hour_start: Math.floor(hour_start.getTime() / 1000) };
}

async function tvl() {
  const timeAgg = calculateAgg();
  const spicyLpFarmTvl = await fetchPoolsAndReduce(timeAgg);
  
  return {
    tezos: spicyLpFarmTvl
  };
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    methodology: `TVL counts the value of $SPI/WTZ LP tokens staked in each pool's LP-based Spice Farm. Data is aggregated from: ${SPICY_URL}.`,
    tezos: {
      tvl,
    }
}