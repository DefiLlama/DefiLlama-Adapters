const utils = require("./helper/utils");
const { toUSDTBalances } = require('./helper/balances');
let _response

function fetchChain(chainId, staking) {
  return async () => {
    if (!_response) _response = utils.fetchURL('https://api.vaporwave.farm/tvl')
    const response = await _response;

    let tvl = 0;
    const chain = response.data[chainId];
    for (const vault in chain) {
      const isVWAVE = vault.includes("vwave")
      if ((isVWAVE && staking) || (!isVWAVE && !staking)) {
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
  polygon_zkevm: 1101,
  arbitrum: 42161,
  aurora: 1313161554,
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  // deadFrom: '2024-08-01',
  methodology:
  'TVL data is pulled from the Vaporwave Finance API "https://api.vaporwave.farm/tvl".',
  doublecounted: true,
  ...Object.fromEntries(Object.entries(chains).map(chain => [chain[0], {
    tvl: () => ({}),
    staking: () => ({}),
  }]))
}


