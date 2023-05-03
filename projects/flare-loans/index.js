const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports={
    methodology: "We count all WSGB on 0xFa21A4ABD1a58CefAB79CFd597aCcc314403eE9f and all EXFI on 0x4595fc96262057f9b0d4276ff04de8f2f44e612e, which are backing the stablecoin",
    songbird: {
        tvl: sumTokensExport({chain: 'songbird', tokensAndOwners: [
            ['0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED', '0xFa21A4ABD1a58CefAB79CFd597aCcc314403eE9f'],
            ['0xC348F894d0E939FE72c467156E6d7DcbD6f16e21','0x4595fc96262057f9b0d4276ff04de8f2f44e612e']
        ]})
    }
}