const { request, gql } = require("graphql-request");
const {toUSDTBalances} = require("../helper/balances");

const graphUrl =
    'https://api.thegraph.com/subgraphs/name/sturdyfi/sturdy-fantom';

const graphQuery = gql`
    query get_tvl {
        reserves {
            name
            symbol
            decimals
            price {
                priceInEth
            }
            totalDeposits
            totalLiquidity
            availableLiquidity
        }
    }
`;

const priceInUSD = (value, decimals, price) => {
    return (value / Math.pow(10, decimals) * price / Math.pow(10, 8)).toFixed(2);
}

async function fetch(borrow) {
    const { reserves } = await request(graphUrl, graphQuery);
    const tvl = reserves.reduce((sum, reserve) => {
        const value = borrow ? reserve.totalLiquidity - reserve.availableLiquidity : reserve.totalDeposits;
        return sum + +priceInUSD(value, reserve.decimals, reserve.price.priceInEth);        
    }, 0);
    
    return toUSDTBalances(tvl);
}

async function borrow(_timestamp, _ethBlock, chainBlocks){
    return await fetch(true);
}

async function tvl(_timestamp, _ethBlock, chainBlocks){
    return await fetch(false);
}

module.exports = {
    fantom:{
        tvl,
        borrow,
    },
};
