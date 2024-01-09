const { get } = require('../helper/http');

async function fetchData() {
  return await get('https://backend.sovryn.app/tvl');
}

let sharedPromise = null;

function getSharedData() {
  if (!sharedPromise) {
    sharedPromise = fetchData();
  }
  return sharedPromise;
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  rsk: {
    tvl: async () => {
      const { tvlAmm, tvlProtocol } = await getSharedData();
      return {
        'tether': tvlAmm.totalUsd + tvlProtocol.totalUsd
      };
    },
    staking: async () => {
      const { tvlStaking } = await getSharedData();
      return {
        'tether': tvlStaking.totalUsd
      };
    }
  }
};

