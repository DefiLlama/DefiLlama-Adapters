const { getUniTVL } = require('../helper/unknownTokens.js');

const abis = {
  allPairsLength: 'uint256:allPoolsLength',
  allPairs: 'function allPools(uint256) view returns (address)'
};

const MEZO_POOL_FACTORY_ADDRESS = "0x83FE469C636C4081b87bA5b3Ae9991c6Ed104248";

module.exports = {
  mezo: {
    tvl: getUniTVL({
        abis,
        factory: MEZO_POOL_FACTORY_ADDRESS,
        fetchBalances: true,
        hasStablePools: true,
        permitFailure: true
    })
  }
};