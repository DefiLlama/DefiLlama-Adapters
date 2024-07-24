const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ tokens: ['0x67954768E721FAD0f0f21E33e874497C73ED6a82'], owner: '0x53423b7bf445997e76ad94f820f0559e451a98e2', logCalls: true }),
  },
  kekchain: {
    tvl: () => ({}),
    // tvl: sumTokensExport({ tokens: [nullAddress ], owner: '0x0c851a31F484A7b462B82E138A2fa591ae8Fadc9', }),
  },
}