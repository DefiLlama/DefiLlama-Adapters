const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'fantom': '0xc6366EFD0AF1d09171fe0EBF32c7943BB310832a',
  'sonic': '0xDDD9845Ba0D8f38d3045f804f67A1a8B9A528FcC',
}, { hasStablePools: true, stablePoolSymbol: 's-', staking: { fantom: ["0x8313f3551C4D3984FfbaDFb42f780D0c8763Ce94", "0x3Fd3A0c85B70754eFc07aC9Ac0cbBDCe664865A6"]} })