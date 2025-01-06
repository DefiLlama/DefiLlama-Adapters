const sdk = require("@defillama/sdk");

module.exports = {
    'ancient8': {
        tvl: async (api) => {
            const ethApi = new sdk.ChainApi({ chain: 'ethereum' })
            return await ethApi.sumTokens({ 
                owners: [
                    '0xd42D4417D7f757BAD6A5EA5E40a53649fD50B349' //staking
                ], 
                tokens: [
                    '0x3E5A19c91266aD8cE2477B91585d1856B84062dF', //a8 tokens
                    '0x0000000000000000000000000000000000000000'
                ] 
            })
        }
    }
}
