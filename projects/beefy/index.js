const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');
let _response

const distressedAssets = ['aleth']; // Add any distressed asset names here

function fetchChain(chainId, staking) {
  return async () => {
    if (!_response) _response = utils.fetchURL('https://api.beefy.finance/tvl')
    const response = await _response;

    let tvl = 0;
    const chain = response.data[chainId];
    for (const vault in chain) {
      // Skip distressed assets
      if (distressedAssets.some(asset => vault.includes(asset))) {
        continue;
      }

      const isBIFI = vault.includes("bifi")
      if ((isBIFI && staking) || (!isBIFI && !staking)) {
        tvl += Number(chain[vault]);
      }
    }
    if (tvl === 0 && !staking) {
      throw new Error(`chain ${chainId} tvl is 0`)
    }

    return toUSDTBalances(tvl);
  }
}

const chains = {
  ethereum: 1,
  optimism: 10,
  cronos: 25,
  rsk: 30,
  bsc: 56,
  xdai: 100,
  fuse: 122,
  heco: 128,
  polygon: 137,
  manta: 169,
  fantom: 250,
  fraxtal: 252,
  era: 324,
  metis: 1088,
  polygon_zkevm: 1101,
  moonbeam: 1284,
  moonriver: 1285,
  sei: 1329,
  kava: 2222,
  mantle: 5000,
  canto: 7700,
  base: 8453,
  mode: 34443,
  arbitrum: 42161,
  celo: 42220,
  oasis: 42262,
  avax: 43114,
  linea: 59144,
  real: 111188,
  scroll: 534352,
  aurora: 1313161554,
  harmony: 1666600000
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  ...Object.fromEntries(Object.entries(chains).map(chain => [chain[0], {
    tvl: fetchChain(chain[1], false),
    staking: fetchChain(chain[1], true),
  }]))
}
