const { get } = require('../helper/http');

const SOLANA = 'SOLANA';
const TVL_KEY = 'tvl';
const VESTING_KEY = 'tvl_vested';
const api =
  'https://metabase.internal-streamflow.com/_public/api/v1/stats/accumulated';

const getValueForKey = (arr, key) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].chain === SOLANA && arr[i][key] !== undefined) {
      return arr[i][key];
    }
  }
  return null;
}

async function tvl() {
  return {
    tether: getValueForKey(await get(api), TVL_KEY),
  }
}
async function vesting() {
  return {
    tether: getValueForKey(await get(api), VESTING_KEY),
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  solana: {
    tvl, vesting,
  },
}
