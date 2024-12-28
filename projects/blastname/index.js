const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unknownTokens')

const BNSPoolAddr = '0xb5510aB65418d53961A9fd32A8E6343f942E20Aa'
const BWETHAddr = '0x9d5d8Ca81FF96b676603a69282290c0D957C7060'

const BNDUSDBAddr = '0x389daCE33EF8a7E020196F388cF107A881799872'
const BNSUSDBAddr = '0xdD9B243A18Fb4e46AefFa26D42797f0Be9F9AfC8'
const BNDJUICEAddr = '0x44EA24695ECB6c09C3aB756224757a5D68707618'
const BNDBNSAddr = '0xb6851BF01D81be84d13e92aDFE6F64A7D02A643f'

module.exports = {
  blast: {
    tvl: sumTokensExport({ 
      tokensAndOwners: [
        [ADDRESSES.blast.WETH, BNSPoolAddr],
        [ADDRESSES.blast.USDB, BNSPoolAddr],
        [ADDRESSES.blast.WETH, BWETHAddr],
      ]
    }),
    pool2: sumTokensExport({
      tokensAndOwners: [
        [BNDUSDBAddr, BNSPoolAddr],
        [BNSUSDBAddr, BNSPoolAddr],
        [BNDJUICEAddr, BNSPoolAddr],
        [BNDBNSAddr, BNSPoolAddr],
      ], useDefaultCoreAssets: true,
    }),
  }
}
