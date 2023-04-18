const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  polygon_zkevm: {
    tvl: sumTokensExport({ owner: '0x05Cd3c8Ded966BE2556A8A83190aEF845f24eB76', tokens: ['0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035']})
  }
};
