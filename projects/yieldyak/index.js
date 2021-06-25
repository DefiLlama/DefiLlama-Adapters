const sdk = require('@defillama/sdk');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const { request, gql } = require("graphql-request");
const token0 = require('../helper/abis/token0.json');
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
    const tokens0 = await sdk.api.abi.multiCall({
        calls:tokens.output.map(t=>({
            target: t.output
        })),
        abi: token0,
        block,
        chain: 'avax'
    })
    const lpBalances = []
    const balances = {}
    tokens0.output.forEach((result, idx)=>{
        const token = tokens.output[idx].output || farms[idx].depositToken.id
        const balance = tokenAmounts.output[idx].output //|| farms[idx].depositTokenBalance
        console.log(token, balance, result.success)
        if(result.success){
            lpBalances.push({
                token,
                balance
            })
        } else {
            sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
        }
    })
    await unwrapUniswapLPs(balances, lpBalances, block, 'avax', transformAddress)
    return balances
}

module.exports = {
    tvl
}