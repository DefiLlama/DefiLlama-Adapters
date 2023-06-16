const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0x70e881fa43a7124e36639b54162395451cef1922',
      abi: 'uint256:allPairs',
      useDefaultCoreAssets: true,
      fetchBalances: true,
    })
  },
};
