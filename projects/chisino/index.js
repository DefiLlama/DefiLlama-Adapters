const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  megaeth: {
    tvl: sumTokensExport({
      owner: '0x5d3712fF54226A55ab8fE866678A87a73cBC49b7',
      token: '0x2eA493384F42d7Ea78564F3EF4C86986eAB4a890', // USDmY
    }),
  }
}
