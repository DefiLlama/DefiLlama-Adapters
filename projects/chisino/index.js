const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  megaeth: {
    tvl: sumTokensExport({
      owner: '0x4fd02a1A80923cE1D7E70A8719421431Ea286941',
      token: '0x2eA493384F42d7Ea78564F3EF4C86986eAB4a890', // USDmY
    }),
  }
}
