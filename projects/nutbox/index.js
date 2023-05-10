
const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require('graphql-request');
const client = new GraphQLClient('https://api.thegraph.com/subgraphs/name/terryyyyyy/walnutinbsc')

async function getBSCPools() {
    const query = gql`
    query Pools {
        pools(where: {status: OPENED, poolFactory: "0xf870724476912057C807056b29c1161f5Fe0199a"}, first: 1000){
            id
            asset
            status
            chainId
            totalAmount
            poolFactory
        }
    }
    `
    try{
        const data = await client.request(query)
        if (data && data.pools) {
            const pools = data.pools
            return pools
        }
    }catch(e) {
        console.log('Get community from graph fail:', e);
        return []
    }
}

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const pools = await getBSCPools();

  for (let p of pools) {
    // balances['bsc:' + p.asset] = p.totalAmount; 
    await sdk.util.sumSingleBalance(balances, p.asset, p.totalAmount, api.chain)
  }
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of Nubox staking tokens in the ERC20 staking contract.',
  start: 15414978,
  bsc: {
    tvl,
  }
}; 