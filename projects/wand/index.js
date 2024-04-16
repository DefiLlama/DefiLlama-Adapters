const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  blast: {
    tvl: sumTokensExport({ 
      owners: [
        '0xDC3985196D263E5259AB946a4b52CEDCBaDC1390', // $ETH vault's token pot
        '0xfD7D3d51b081FBeA178891839a9FEd5ca7896bDA', // $ETH vault's pty pool buy low
        '0x2F5007df87c043552f3c6b6e5487B2bDc92F0232', // $ETH vault's pty pool sell high
        '0x05c061126A82DC1AfF891b9184c1bC42D380a2ff',  // $USDB vault's token pot
        '0x7063ea2dBa364aCd9135752Da5395ac7CD12313D', // $ETH V2 vault's token pot
        '0x3ee083573FceA8c015dcbfC7a51777B5770cbe64', // $ETH V2 vault's pty pool buy low
        '0x39db7083C97d2C298C1A88fD27b0bd1C9c9f6fa8', // $ETH V2 vault's pty pool sell high
        '0x565e325B7197d6105b0Ee74563ea211Cc838e2c3'  // $USDB V2 vault's token pot
      ],
      tokens: [
        ADDRESSES.null,  // $ETH
        ADDRESSES.blast.USDB  // $USDB
      ],
    }),
  }
};