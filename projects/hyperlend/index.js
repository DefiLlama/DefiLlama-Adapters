const { aaveChainTvl, aaveExports } = require('../helper/aave');
const methodologies = require('../helper/methodologies');
const { mergeExports } = require('../helper/utils');

function v3(chain) {
  let params = ["0xF38A8A25DafdCFb5126008ed1f9f2333C3129c93", undefined, ["0x824A4309686C74C3369Ab2273A6f2ced629422e2"]]
  const section = borrowed => aaveChainTvl(chain, ...params, borrowed, true);
  return {
    tvl: section(false),
    borrowed: section(true)
  }
}

module.exports = mergeExports({
  methodology: methodologies.lendingMarket,
  arbitrum: v3("arbitrum"),
});
// node test.js projects/hyperlend/index.js
