const axios = require('axios')

// Mapping deployment suffixes to chains (adjust as needed)
const CHAIN_SUFFIXES = {
  ethereum: ['mainnet'],
  arbitrum: ['arbitrum'],
  polygon: ['polygon'],
  optimism: ['optimism'],
  bsc: ['bsc'],
  base: ['base'],
  moonbeam: ['moonbeam'],
  celo: ['celo'],
  avax: ['avalanche'],
  fantom: ['fantom'],
  mantle: ['mantle'],
  rollux: ['rollux'],
  linea: ['linea'],
  kava: ['kava'],
  op_bnb: ['op_bnb'],
  manta: ['manta'],
  metis: ['metis'],
  xdai: ['gnosis', 'xdai'],
  imx: ['immutable', 'imx'],
  scroll: ['scroll'],
  blast: ['blast'],
  xlayer: ['xlayer'],
  mode: ['mode'],
  taiko: ['taiko'],
  rsk: ['rootstock', 'rsk'],
  iotaevm: ['iota'],
  core: ['core'],
  zircuit: ['zircuit'],
  wc: ['worldchain', 'wc'],
  apechain: ['apechain'],
  sonic: ['sonic'],
  bob: ['bob'],
  hemi: ['hemi'],
  nibiru: ['nibiru'],
  sei: ['sei'],
  berachain: ['berachain'],
  unichain: ['unichain'],
};

// Optional: staking patch for Ethereum
const { staking } = require("../helper/staking");

let cachedDeployments = null;
let lastFetch = 0;
const CACHE_TIME = 60 * 1000; // 1 minute cache

async function getDeployments() {
  if (!cachedDeployments || (Date.now() - lastFetch) > CACHE_TIME) {
    const { data } = await axios.get('https://api.gamma.xyz/allDeployments/hypervisors/aggregateStats?dexDesign=all');
    cachedDeployments = data.deployments;
    lastFetch = Date.now();
  }
  return cachedDeployments;
}

async function getChainTVL(chain) {
  const deployments = await getDeployments();
  const suffixes = CHAIN_SUFFIXES[chain];
  let tvl = 0;
  Object.entries(deployments).forEach(([deployment, data]) => {
    if (suffixes.some(suffix => deployment.endsWith('-' + suffix))) {
      tvl += Number(data.totalValueLockedUSD || 0);
    }
  });
  return { usd: tvl };
}

const adapter = {
  doublecounted: true,
  start: '2021-03-25',
};

Object.keys(CHAIN_SUFFIXES).forEach(chain => {
  adapter[chain] = {
    tvl: async () => getChainTVL(chain),
  }
})

// Ethereum staking export (optional)
adapter.ethereum.staking = staking(
  "0x26805021988f1a45dc708b5fb75fc75f21747d8c",
  "0x6bea7cfef803d1e3d5f7c0103f7ded065644e197"
);

module.exports = adapter;