const sdk = require("@defillama/sdk");
const axios = require('axios')

const apiEndpoint = 'https://gambit-server-staging.uc.r.appspot.com/tokens'
const pool = "0xc73A8DcAc88498FD4b4B1b2AaA37b0a2614Ff67B"
async function tvl(timestamp, block, chainBlocks) {
    const balances = {}
    const allTokens = (await axios.get(apiEndpoint)).data
    const tokenBalances = await sdk.api.abi.multiCall({
        calls: allTokens.map(token=>({
            target: token.id,
            params: [pool]
        })),
        abi: 'erc20:balanceOf',
        chain: 'bsc',
        block: chainBlocks.bsc
    })
    sdk.util.sumMultiBalanceOf(balances, tokenBalances, d=>`bsc:${d}`)
    return balances
}

module.exports = {
    name: "Gambit",
    token: "GMT",
    category: "DEXes",
    bsc: {
        tvl
    },
    tvl
};
