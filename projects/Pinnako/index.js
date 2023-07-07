const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');
module.exports = {
    // era: {
    //     tvl: sdk.util.sumChainTvls([
    //         async (_, _1, _2, { api }) => {
    //             const vault = '0x33579126BF9B42113BF69783c1c307e04b15EA14'
    //             const tokens = await api.call({ abi: 'address[]:fundingTokenList', target: vault })
    //             return sumTokens2({ api, owner: vault, tokens, })
    //         },
    //         async (_, _1, _2, { api }) => {
    //             const vault = '0x87A43dfAB5068c9Ae2f75da2906559bc9A71b42d'
    //             const tokens = await api.call({ abi: 'address[]:fundingTokenList', target: vault })
    //             return sumTokens2({ api, owner: vault, tokens, })
    //         },
    //     ])
    // }
    era: {
        tvl: sdk.util.sumChainTvls([
            async (_, _1, _2, { api }) => {
                const vault = '0x87A43dfAB5068c9Ae2f75da2906559bc9A71b42d'
                const tokens = ["0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91", "0xBBeB516fb02a01611cBBE0453Fe3c580D7281011", "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4", "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C"]
                return sumTokens2({ api, owner: vault, tokens, })
            }
        ])
    },
}
