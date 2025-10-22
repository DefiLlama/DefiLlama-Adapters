const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')
module.exports = {
  start: '2023-07-26',
  ethereum: {
    tvl: sumTokensExport({ owner: '0x9C1F0E3D4BD4A513721C028e1D4610CD17745f0B', tokens: [nullAddress] }),
  }
}