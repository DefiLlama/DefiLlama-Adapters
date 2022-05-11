const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');

function fetchChain(chainId, staking) {
  return async () => {
      const response = await utils.fetchURL('https://api.beefy.finance/tvl?q=1666600000');

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
  cronos: 25,
  bsc: 56,
  fuse: 122,
  heco: 128,
  polygon: 137,
  fantom: 250,
  metis: 1088,
  moonbeam: 1284,
  moonriver: 1285,
  arbitrum: 42161,
  celo: 42220,
  avalanche: 43114,
  aurora: 1313161554,
  harmony: 1666600000
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  ...Object.fromEntries(Object.entries(chains).map(chain=>[chain[0], {
    tvl: fetchChain(chain[1], false),
    staking: fetchChain(chain[1], true),
  }]))
}
