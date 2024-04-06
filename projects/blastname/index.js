const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unknownTokens')

const BNDPoolAddr1 = '0xe875B8D17973a306fd0727B6a578695CE136C2cA'
const BNDPoolAddr2 = '0x56C09e6d859477aF3863408Cf8BA3C427b61782c'
const BNSPoolAddr = '0xb5510aB65418d53961A9fd32A8E6343f942E20Aa'

module.exports = {
  blast: {
    tvl: sumTokensExport({ tokensAndOwners: [[ADDRESSES.blast.USDB, BNDPoolAddr1]] }),
    pool2: sumTokensExport({
      tokensAndOwners: [
        ['0xa21406a95195D449646EA97D550CC97BD62B4B7A', BNDPoolAddr1],
        ['0xD80f694FB00215262169AFF73f8626f7989353A7', BNDPoolAddr2],
        ['0x389daCE33EF8a7E020196F388cF107A881799872', BNSPoolAddr],
        ['0xdD9B243A18Fb4e46AefFa26D42797f0Be9F9AfC8', BNSPoolAddr],], useDefaultCoreAssets: true,
    }),
  }
}
