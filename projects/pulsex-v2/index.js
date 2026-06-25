const { getUniTVL } = require('../helper/unknownTokens');

// PulseX V2 is a standard Uniswap V2 fork on PulseChain.
// Factory exposes allPairsLength()/allPairs(uint) and pairs expose getReserves()/token0()/token1().
// https://otter.pulsechain.com/address/0x29eA7545DEf87022BAdc76323F373EA1e707C523
const factory = '0x29eA7545DEf87022BAdc76323F373EA1e707C523';

module.exports = {
  methodology: 'Enumerates all PulseX V2 pairs on-chain via the factory and sums the reserves of known (core) assets held in the liquidity pools.',
  isHeavyProtocol: true,
  pulse: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true }),
  },
};
