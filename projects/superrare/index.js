const { request, gql } = require("graphql-request");

async function staking(_time, block){
    const query = gql`query AllRareLocked ($block: Int) {
        pools(first: 1000, block: { number: $block }) {
            totalRareLocked
        }
    }`
    const result = await request("https://gateway-arbitrum.network.thegraph.com/api/5fba66cce34542163f90501c363f99e8/subgraphs/id/Cc4fyxiBkZYdzATQDhTv3zLzfEwRupygp7HB2WWQciw5", query, {
        block,
    });
    return {
        "0xba5BDe662c17e2aDFF1075610382B9B691296350": result.pools.reduce((sum, a)=>sum+Number(a.totalRareLocked), 0)
    }
}

module.exports={
    ethereum:{
        staking,
        tvl: async()=>({})
    }
}