const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  polygon_zkevm: {
    tvl: sumTokensExport({ owner: '0x4eA8496D4D1d4EcF6eD6DaeA95D1A0856F8A5177', tokens: [ADDRESSES.polygon_zkevm.USDC]})
  }
};
