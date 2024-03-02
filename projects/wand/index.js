const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  blast: {
    tvl: sumTokensExport({ 
      owners: [
        '0xDC3985196D263E5259AB946a4b52CEDCBaDC1390', // $ETH vault's token pot
        '0xfD7D3d51b081FBeA178891839a9FEd5ca7896bDA', // $ETH vault's pty pool buy low
        '0x2F5007df87c043552f3c6b6e5487B2bDc92F0232' // $ETH vault's pty pool sell high
      ],
      tokens: [ '0x0000000000000000000000000000000000000000'], // $ETH
    }),
  }
};