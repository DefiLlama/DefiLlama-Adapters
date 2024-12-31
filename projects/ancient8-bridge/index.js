const sdk = require("@defillama/sdk");

module.exports = {
    'ancient8': {
        tvl: async (api) => {
            const ethApi = new sdk.ChainApi({ chain: 'ethereum' })
            return await ethApi.sumTokens({ 
                owners: [
                    '0x12d4e64e1b46d27a00fe392653a894c1dd36fb80', //l1 bridge
                    '0x639F2AECE398Aa76b07e59eF6abe2cFe32bacb68', //l1 eth holder
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
