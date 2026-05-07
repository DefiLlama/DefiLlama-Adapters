const { getUniTVL } = require('../helper/unknownTokens.js');

const abis = {
  allPairsLength: 'uint256:allPoolsLength',
  allPairs: 'function allPools(uint256) view returns (address)'
};

const MEZO_POOL_FACTORY_ADDRESS = "0xBB24AF5c6fB88F1d191FA76055e30BF881BeEb79";

module.exports = {
  mezo: {
    tvl: getUniTVL({
        abis,
        factory: MEZO_POOL_FACTORY_ADDRESS,
        fetchBalances: true,
        permitFailure: true
    })
  }
};