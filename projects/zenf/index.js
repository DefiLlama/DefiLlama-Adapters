const { sumTokensExport } = require('../helper/sumTokens')

module.exports={
    ethereum:{
        tvl: sumTokensExport({
            owner: '0xe9b7b5d5e8d2bcc78884f9f9099bfa42a9e5c1a5',
            tokens: ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0xdac17f958d2ee523a2206206994597c13d831ec7', '0x4fabb145d64652a948d72533023f6e7a623c7c53', '0x6b175474e89094c44da98b954eedeac495271d0f', ],
        })
    },
    bsc:{
        tvl: sumTokensExport({
            owner: '0x382EC3F9F2E79b03abF0127f3Aa985B148cEf6d7',
            tokens: ['0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', '0x55d398326f99059ff775485246999027b3197955', '0xe9e7cea3dedca5984780bafc599bd69add087d56', ],
        })
    }
}