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
  doublecounted: false,
  methodology: "Calculate TVL by summing up all vaults' TVLs.",
  polygon: {
    tvl: fetchChain(137),
    staking: staking(stakingAddress, sphere_token, 'polygon'),
  },
  arbitrum: {
    tvl: fetchChain(42161),
  },
  optimism: {
    tvl: fetchChain(10),
  },
}