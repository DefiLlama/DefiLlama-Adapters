const {fetchURL, getPricesfromString} = require('../helper/utils')
const {getChainTvl} = require('../helper/getUniSubgraphTvl')
const staking = require('../helper/staking')
const sdk = require('@defillama/sdk')

const che = "0x8179d97eb6488860d816e3ecafe694a4153f216c"
const cheStaking = "0x9Ab8BCf67fE8d8D2aD27D42Ec2A0fD5C206DAE60"

async function fetch() {
    const response = await fetchURL('https://cherryswap.net/api/tvl')
    const liquidityTvl = Number(response.data.liquidityTvl)
    const poolsTvl = Number(response.data.poolsTvl)
    const stakedChe = await sdk.api.erc20.balanceOf({
        target: che,
        owner: cheStaking,
        chain: 'okexchain'
    })
    const stakedCheNum = Number(stakedChe.output)/1e18
    const chePrice = (await getPricesfromString("cherryswap")).data.cherryswap.usd

    return liquidityTvl+ poolsTvl-(stakedCheNum*chePrice)
}

const chainTvls = getChainTvl({
    "okexchain": "https://okinfo.cherryswap.net/subgraphs/name/cherryswap/cherrysubgraph"
})

module.exports = {
    methodology: "Staking is the CHE staked on 0x9Ab8BCf67fE8d8D2aD27D42Ec2A0fD5C206DAE60, tvl is the liquidity on the exchange and the money locked on the pools that distribute CHE",
    //tvl: chainTvls("okexchain"), // historical
    fetch,
    staking:{
        tvl: staking(cheStaking, che, "okexchain", "okexchain:"+che)
    },
}
