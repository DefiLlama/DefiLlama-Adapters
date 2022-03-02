const BigNumber = require('bignumber.js')
const { GraphQLClient, gql, request } = require('graphql-request')


async function fetch() {
    var xdexApi = 'https://api.thegraph.com/subgraphs/name/xdefilab/xdefidex';
    var xdexGraphQLClient = new GraphQLClient(xdexApi)
    var xdexQuery = gql`
    {
        xdefis(first: 1) {
            id,
            version,
            totalLiquidity,
            totalSwapVolume
        }
    }
  `;
    const { xdefis } = await xdexGraphQLClient.request(xdexQuery)
    const xdexTotalLiquidity = new BigNumber(xdefis[0].totalLiquidity);

    var xhalflifeApi = 'https://api.thegraph.com/subgraphs/name/xdefilab/xhalflife';
    var xhalflifeGraphQLClient = new GraphQLClient(xhalflifeApi)
    var xhalflifeQuery = gql`
    {
    streamTotalDatas(first: 100, orderBy: locked, orderDirection:desc) {
            id
            token
            {
                id
                symbol
                decimals
            }
            count
            locked
            withdrawed
        }
     }
    `;
    const { streamTotalDatas } = await xhalflifeGraphQLClient.request(xhalflifeQuery)

    const tokenDataWithLocked = streamTotalDatas.reduce((all, current) => {
        return {
            ...all,
            [current.id]: {
                id: current.id,
                locked: current.locked,
                symbol: current.token.symbol
            }
        }
    }, {})

    const tokenPriceQuery = gql`
    query getTokenPrices($ids: [String!]){
        tokenPrices(first:100,where:{
            id_in: $ids
        }){
            id
            symbol
            price
        }
    }
    `
    const ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const usdt = "0xdac17f958d2ee523a2206206994597c13d831ec7"
    const dai = "0x6b175474e89094c44da98b954eedeac495271d0f"
    const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

    const { tokenPrices } = await request(xdexApi, tokenPriceQuery, { ids: Object.keys(tokenDataWithLocked).concat(wethAddress) })

    Object.keys(tokenDataWithLocked).forEach(token => {
        const findToken = tokenPrices.find(tokenPrice => tokenPrice.id == token);
        if (findToken) {
            tokenDataWithLocked[token].price = findToken.price
        } else {
            if (token === ethAddress) {
                tokenDataWithLocked[token].price = tokenPrices.find(tokenPrice => tokenPrice.id == wethAddress).price;
            } else {
                if (token === usdt || token === dai || token === usdc) {
                    tokenDataWithLocked[token].price = 1
                } else {
                    tokenDataWithLocked[token].price = 0
                }
            }
        }
    })

    const tokenTotalValue = Object.keys(tokenDataWithLocked).reduce((all, current) => {
        return all.plus(new BigNumber(tokenDataWithLocked[current].price).times(tokenDataWithLocked[current].locked));
    }, new BigNumber(0))

    return tokenTotalValue.plus(xdexTotalLiquidity).toString();
}

module.exports = {
    fetch
}
