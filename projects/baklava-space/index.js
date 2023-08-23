const utils = require('../helper/utils');
const { staking } = require('../helper/staking');
const { toUSDTBalances } = require('../helper/balances');
const sdk = require('@defillama/sdk');
const abi = require("./abi.json");

let _response

const stfxVault = '0x5c24B402b4b4550CF94227813f3547B94774c1CB';
const bavaStakingRewards = "0x2F445C4cC8E114893279fa515C291A3d02160b02"
const bavaToken = "0xe19A1684873faB5Fb694CfD06607100A632fF21c"

// Avalanche
function fetchChain(chainId, staking) {
  return async () => {
    if (!_response) _response = utils.fetchURL('https://ap-southeast-1.aws.data.mongodb-api.com/app/defillamadata-rnijf/endpoint/tvl')
    const response = await _response;

    let tvl = 0;
    const chain = response.data["TVL"][chainId];
    for (const vault in chain) {
      tvl += Number(chain[vault])
    }
    return toUSDTBalances(tvl);
  }
}

// FunctionX
async function tvl(timestamp, _block, { functionx: block }) {
  const pooledFX = await sdk.api.abi.call({
    target: stfxVault,
    abi: abi.totalAssets,
    params: [],
    block,
    chain: 'functionx'
  });

  return {
    'fx-coin': pooledFX.output / 1e18
  }
}

// const chains = {
//   avax: 43114,
//   functionx: 530,
// }

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  methodology: `Counts liquidty on the bava staking and lptoken staking on Avalanche and fx token staking on FunctionX`,
  avax: {
    tvl: fetchChain(43114),
    staking: staking(bavaStakingRewards, bavaToken)
  },
  functionx: {
    tvl
  }
};
