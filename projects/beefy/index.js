const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');
let _response

function fetchChain(chainId, staking) {
  return async () => {
    if (!_response) _response = utils.fetchURL('https://api.beefy.finance/tvl')
    const response = await _response;

    let tvl = 0;
    const chain = response.data[chainId];
    for (const vault in chain) {
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
  bsc: 56,
  fuse: 122,
  heco: 128,
  polygon: 137,
  fantom: 250,
  zksync: 324,
  metis: 1088,
  polygon_zkevm: 1101,
  moonbeam: 1284,
  moonriver: 1285,
  kava: 2222,
  canto: 7700,
  arbitrum: 42161,
  celo: 42220,
  oasis: 42262,
  avax: 43114,
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
