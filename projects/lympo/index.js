const { get } = require('../helper/http')
const { sumTokens2 } = require('../helper/unwrapLPs')

const poolsUrl = 'https://api.lympo.io/pools/poolsV2/pools.json';
const sportTokenAddress = "0x503836c8c3A453c57f58CC99B070F2E78Ec14fC0"

async function tvl(timestamp, _, { polygon: block }) {
    const pools = await get(poolsUrl)
    const owners = pools.map(i => i.address)
    return sumTokens2({ chain: 'polygon', block, owners, tokens: [sportTokenAddress]})
}

module.exports = {
    polygon: {
        tvl: tvl
    },
    methodology: "TVL is calculated as value of SPORT tokens in Lympo pools staking",
}