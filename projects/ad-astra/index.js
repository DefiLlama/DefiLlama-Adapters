const { sumTokensExport } = require('../helper/sumTokens')

module.exports={
    ethereum:{
        tvl: sumTokensExport({
            owner: '0x92a26975433a61cf1134802586aa669bab8b69f3',
            tokens: ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0xdac17f958d2ee523a2206206994597c13d831ec7', '0x4fabb145d64652a948d72533023f6e7a623c7c53', '0xdc9Ac3C20D1ed0B540dF9b1feDC10039Df13F99c', ],
        })
    }
}