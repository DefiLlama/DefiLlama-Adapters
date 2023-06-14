const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { sumTokens2 } = require('../helper/unwrapLPs');
const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');

const sphere_token = "0x62F594339830b90AE4C084aE7D223fFAFd9658A7"
const ylSPHEREvault = "0x4Af613f297ab00361D516454E5E46bc895889653"

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
  const dysonTvl = await fetchChain(137)()
  for (const [token, balance] of Object.entries(dysonTvl)) {
    balances[token] = (balances[token] || 0) + balance
  }
  return balances;
} 

let _response

function fetchChain(chainId) {
  return async () => {
    if (!_response) _response = utils.fetchURL('https://api.dyson.money/tvl')
    const response = await _response;

    let tvl = 0;
    const chain = response.data[chainId];
    for (const vault in chain) {
      tvl += Number(chain[vault]);
    }
    
    if (tvl === 0) {
      throw new Error(`chain ${chainId} tvl is 0`)
    }

    return toUSDTBalances(tvl);
  }
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: false,
  methodology: "TVL is calculated by summing the liquidity in the Uniswap V3 pools.",
  polygon: {
    tvl: polygonTvl,
    staking: staking(ylSPHEREvault, sphere_token, "polygon")
  },
  optimism: {
    tvl: fetchChain(10),
  },
  arbitrum: {
    tvl: fetchChain(42161),
  },
  bsc: {
    tvl: fetchChain(56)
  },
  avax: {
    tvl: fetchChain(43114)
  }
};
