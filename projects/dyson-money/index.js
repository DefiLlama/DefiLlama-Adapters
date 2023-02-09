const { staking } = require('../helper/staking')
const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');
const sphere_token = "0x62f594339830b90ae4c084ae7d223ffafd9658a7"
const stakingAddress = "0x4Af613f297ab00361D516454E5E46bc895889653" // ylSPHERE
let _response

function fetchChain(chainId) {
  return async () => {
    if (!_response) _response = utils.fetchURL('https://api.dyson.money/tvl')
    const response = await _response;

    let tvl = 0;
    const chain = response.data[chainId];
    for (const vault in chain) {
      if (vault !== 'totalTVL') {
        tvl += Number(chain[vault]);
      }
    }
    if (tvl === 0) {
      throw new Error(`chain ${chainId} tvl is 0`)
    }

    return toUSDTBalances(tvl);
  }
}

const chains = {
  optimism: 10,
  polygon: 137,
  arbitrum: 42161,
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  staking: staking(stakingAddress, sphere_token, 'polygon'),
  ...Object.fromEntries(Object.entries(chains).map(chain => [chain[0], {
    tvl: fetchChain(chain[1], false),
  }]))
}