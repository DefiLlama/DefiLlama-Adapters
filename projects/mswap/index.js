const { getUniTVL } = require('../helper/unknownTokens');
const sdk = require('@defillama/sdk');

const factory = '0x338bCC4efd3cA000D123d7352b362Fc6D5B3D829';
const chain = 'matchain';

const ammTvl = getUniTVL({
  chain,
  factory,
  useDefaultCoreAssets: false,
  fetchBalances: true,
});

module.exports = {
  matchain: {
    tvl: ammTvl,
  },
  misrepresentedTokens: true,
};
