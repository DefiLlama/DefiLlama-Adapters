const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { sumTokens2 } = require('../helper/unwrapLPs');
const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');


const TVL_URL = 'https://api2.dyson.money/vaults/metrics/tvl';

const sphere_token = "0x62F594339830b90AE4C084aE7D223fFAFd9658A7"
const ylSPHEREvault = "0x4Af613f297ab00361D516454E5E46bc895889653"


let TVL_byNetwork;

async function polygonTvl(timestamp, block, chainBlocks) {
  let balances = {};

  // add tokens in ylSPHERE vault
  await sumTokens2({
    balances,
    owners: [ylSPHEREvault],
    tokens: [
      ADDRESSES.polygon.WMATIC_2,
      ADDRESSES.polygon.USDC,
      ADDRESSES.polygon.WETH_1,
      ADDRESSES.polygon.USDT,
      ADDRESSES.polygon.WBTC,
      "0x172370d5Cd63279eFa6d502DAB29171933a610AF"
    ],
    chain: 'polygon',
    block: chainBlocks.polygon
  })

  // calculate TVL for polygon from API
  const polygon_tvl = await fetchNetworkTVL('polygon')();
  for (const [token, balance] of Object.entries(polygon_tvl)) {
    balances[token] = (balances[token] || 0) + balance
  }
  return balances;
} 

function fetchNetworkTVL(network) {
  return async () => {
    try {
      if(!TVL_byNetwork) TVL_byNetwork = utils.fetchURL(`${TVL_URL}`).then(response => response.data);

      const response = await TVL_byNetwork;
      const total = Number(response[network].total); // all numeric values on the API are stored as string for precision

      if(!total) return {}

      return toUSDTBalances(total);
    } catch(e) {
      console.error(`There was an error trying to fetch 'dyson-money' TVL on network - ${network}. Exited with error: ${e}`);
      return {};
    }
  }
}



module.exports = {
  doublecounted: true,
    methodology: "Counts the tokens locked in the contracts.",
  polygon: {
    tvl: polygonTvl,
    staking: staking(ylSPHEREvault, sphere_token)
  },
  optimism: {
    tvl: fetchNetworkTVL('optimism'),
  },
  arbitrum: {
    tvl: fetchNetworkTVL('arbitrum'),
  },
  bsc: {
    tvl: fetchNetworkTVL('binance')
  },
  avax: {
    tvl: fetchNetworkTVL('avalanche')
  },
  kava: {
    tvl: fetchNetworkTVL('kava'),
  },
  base: {
    tvl: fetchNetworkTVL('base'),
  },
};
