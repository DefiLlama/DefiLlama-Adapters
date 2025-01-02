const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports={
    methodology: "We count all WSGB on 0xFa21A4ABD1a58CefAB79CFd597aCcc314403eE9f and all EXFI on 0x4595fc96262057f9b0d4276ff04de8f2f44e612e, which are backing the stablecoin",
    songbird: {
        tvl: sumTokensExport({tokensAndOwners: [
            [ADDRESSES.songbird.WSGB, '0xFa21A4ABD1a58CefAB79CFd597aCcc314403eE9f'],
            [ADDRESSES.songbird.EXFI,'0x4595fc96262057f9b0d4276ff04de8f2f44e612e']
        ]})
    }
}