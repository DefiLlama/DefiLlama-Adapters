const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  polygon_zkevm: {
    tvl: sumTokensExport({ owner: '0x4eA8496D4D1d4EcF6eD6DaeA95D1A0856F8A5177', tokens: ['0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035']})
  }
};
