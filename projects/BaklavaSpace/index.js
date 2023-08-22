const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');
let _response

const distressedAssets = ['aleth']; // Add any distressed asset names here

function fetchChain(chainId, staking) {
  return async () => {
    if (!_response) _response = utils.fetchURL('https://ap-southeast-1.aws.data.mongodb-api.com/app/bdl-uyejj/endpoint/tvl')
    const response = await _response;

    let tvl = 0;
    const chain = response.data[chainId];
    for (const vault in chain) {
      // Skip distressed assets
      if (distressedAssets.some(asset => vault.includes(asset))) {
        continue;
      }

      const isBAVA = vault.includes("bava")
      if ((isBAVA && staking) || (!isBAVA && !staking)) {
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
  avax: 43114,
  functionX: 530
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
