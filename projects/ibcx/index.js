const { endPoints, queryContract } = require('../helper/chain/cosmos')
const { transformBalances } = require('../helper/portedTokens')

const chain = 'osmosis'

const contractAddresses = [
    "osmo1yhd9tzp09d833u7ray4pc6wwp72aewtt2xwakszn3lzlf2klnlwscjwhxt", // uibcx 
    "osmo1fw7wc4x7leyf3keud4zdhdnyaanw0sajudg5sgnr93ydjhzmxk6sx84rxe",
    "osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k", // stIBCX
    "osmo1fd33mtk06awg0v2hhd6djcjvvzcv90s8u03qujcjnlu87wm65xjs305mr4",
    "osmo1w2dqd98hzu4ydku5hhv3f0gc468jdlayrqeqedrjxwrq62m7yekqrgvlyu",
    "osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm",
]

async function tvl() {
    let amounts = {}
    if (chain != "osmosis") return transformBalances(chain, amounts)
    for (const contractAddress of contractAddresses) {
        let totalSupply = await queryContract({
            contract: contractAddress,
            chain: 'osmosis',
            data: { 'get_total_supply': {} }
        });
        console.log("totalSupply", totalSupply)

        let config = await queryContract({
            contract: contractAddress,
            chain: 'osmosis',
            data: { 'get_config': {} }
        });
        console.log("config", config)

        let rebalance = await queryContract({
            contract: contractAddress,
            chain: 'osmosis',
            data: { 'get_rebalance': {} }
        });
        console.log("rebalance", rebalance)

        let balance = await queryContract({
            contract: contractAddress,
            chain: 'osmosis',
            data: { 'get_balance': {'account': 'osmo1k8re7jwz6rnnwrktnejdwkwnncte7ek7gt29gvnl3sdrg9mtnqkse6nmqm'} }
        });
        console.log("balance", balance)

        if (typeof amounts['uion'] !== "undefined") {
            amounts['uion'] = totalSupply
        } else {
            amounts['uion'] += totalSupply
        }
    }
    return transformBalances(chain, amounts)
}

module.exports = {
    timetravel: false,
    methodology: "Total TVL on vaults",
    osmosis: {
        tvl,
    },
}