const sdk = require('@defillama/sdk');
const { addTokensAndLPs } = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const { request, gql } = require("graphql-request");
const { transformAvaxAddress } = require('../helper/portedTokens');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/yieldyak/reinvest-tracker'
const graphQuery = gql`
query get_tvl($block: Int) {
    farms(first: 100) {
        id
        name
        depositToken {
          id
        }
        depositTokenBalance
    }
}
`;

async function tvl(timestamp, ethBlock, chainBlocks) {
    const block = chainBlocks.avax;
    const farms = (await request(graphUrl, graphQuery, { block })).farms
    const transformAddress = await transformAvaxAddress()
    const calls = {
        calls: farms.map(f => ({
            target: f.id
        })),
        block,
        chain: 'avax'
    }
    const tokenAmounts = await sdk.api.abi.multiCall({
        ...calls,
        abi: abi.totalDeposits,
    })
    const tokens = await sdk.api.abi.multiCall({
        ...calls,
        abi: abi.depositToken,
    })
    tokens.output.forEach((token, idx)=>{
        if(token.output === null){
            token.output = farms[idx].depositToken.id
        }
    })
    const balances = {}
    await addTokensAndLPs(balances, tokens, tokenAmounts, block, 'avax', transformAddress)
    return balances
}

module.exports = {
    tvl
}