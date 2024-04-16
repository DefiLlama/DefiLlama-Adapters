const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require('../helper/staking')

const EMBER = "0x6BAbf5277849265b6738e75AEC43AEfdde0Ce88D";
const VAULT = "0xFFbE92fDA81f853bcf00d3c7686d5DAd5A6600bB";
const WBCH = ADDRESSES.smartbch.WBCH;
const FACTORY = "0xE62983a68679834eD884B9673Fb6aF13db740fF0";

const EMBER_WBCH_PAIR = "0x52c656FaF57DCbDdDd47BCbA7b2ab79e4c232C28"

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xE62983a68679834eD884B9673Fb6aF13db740fF0) is used to find the LP pairs. TVL is equal to the liquidity on the AMM. Ember tokens sent to vault are counted towards staking.",
  smartbch: {
    tvl: getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true }),
    staking: stakingPricedLP(VAULT, EMBER, "smartbch", EMBER_WBCH_PAIR, "bitcoin-cash", 18)
  }
};
