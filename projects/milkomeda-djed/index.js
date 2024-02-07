const sdk = require('@defillama/sdk');
const { transformBalances } = require('../helper/portedTokens');

const abi = require('./abi.json');
const config = require("./config.json");

async function tvl(chain, chainBlocks) {
  const balances = {};

  const reserve = (await sdk.api.abi.call({
    abi: abi.Djed.reserve, chain: chain, target: config.djedAddress[chain], params: [ 0 ], block: chainBlocks[chain],
  })).output;

  sdk.util.sumSingleBalance(balances, config.reserveTokenAddress[chain], reserve); // Using WADA address instead of mADA
  return transformBalances(chain, balances);
}

module.exports = {
  methodology: 'The TVL of each Djed deployment on Milkomeda C1.',
  milkomeda: {
    start: 10440400,
    tvl: (timestamp, block, chainBlocks) => tvl('milkomeda', chainBlocks)
  },
};
