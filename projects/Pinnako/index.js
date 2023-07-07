const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');

module.exports = {
    zksync: {
        tvl: sdk.util.sumChainTvls([
            async (_, _1, _2, { api }) => {
                const vault = '0x24b6137A5fe9d058baf654bb73aB857F57DF8BB4'
                const tokens = await api.call({ abi: 'address[]:fundingTokenList', target: vault })
                return sumTokens2({ api, owner: vault, tokens, })
            },
        ])
    },
}
