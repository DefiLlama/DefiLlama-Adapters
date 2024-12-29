const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  rsk: {
    // Powpeg (flyover) fast mod protocol
    tvl: sumTokensExport({ owner: '0xAa9caf1e3967600578727f975F283446a3dA6612', tokens: [nullAddress] })
  }
}