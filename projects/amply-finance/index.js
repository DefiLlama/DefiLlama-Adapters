const { aaveChainTvl } = require('../helper/aave');
const methodologies = require('../helper/methodologies');

const v3params = ["0xc8AFD4de7E50f59107a87DB82b5F1Eb2F41D4F0F", undefined, ["0x47656eb2A31094b348EBF458Eccb942d471324eD"]]

function v3() {
  let params = v3params
  const section = borrowed => aaveChainTvl('cronos_zkevm', ...params, borrowed, true);
  return {
    tvl: section(false),
    borrowed: section(true)
  }
}

module.exports = {
  methodology: methodologies.lendingMarket,
  cronos_zkevm: v3(),
  hallmarks: [
    [1659630089, "Start OP Rewards"],
    [1650471689, "Start AVAX Rewards"]
  ],
};
// node test.js projects/aave/index.js
