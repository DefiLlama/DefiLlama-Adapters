const { endPoints, queryContract } = require('../helper/chain/cosmos')
const { transformBalances } = require('../helper/portedTokens')
const axios = require('axios')

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
        const contractBalances = (await axios.get(`https://lcd.osmosis.zone/cosmos/bank/v1beta1/balances/${contractAddress}`)).data.balances
        console.log("contractBalances", contractBalances)
        for (const coin of contractBalances) {
            // stJUNO not be listed on coingecko so we convert stJUNO to the corresponding amount of JUNO base on pool stJUNO/JUNO
            if (coin.denom == "ibc/84502A75BCA4A5F68D464C00B3F610CE2585847D59B52E5FFB7C3C9D2DDCD3FE") {
                const spotPrice = (await axios.get(`https://lcd.osmosis.zone/osmosis/gamm/v2/pools/817/prices?base_asset_denom=ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED&quote_asset_denom=${coin.denom}`)).data.spot_price
                coin.denom = "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED" // JUNO 
                coin.amount = coin.amount / spotPrice
            } 
            // stSTARS not be listed on coingecko so we convert stSTARS to the corresponding amount of STARS base on pool stSTARS/STARS
            if (coin.denom == "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A") {
                const spotPrice = (await axios.get(`https://lcd.osmosis.zone/osmosis/gamm/v2/pools/810/prices?base_asset_denom=ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4&quote_asset_denom=${coin.denom}`)).data.spot_price
                coin.denom = "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4" // STARS 
                coin.amount = coin.amount / spotPrice
            }
            // stUMEE not be listed on coingecko so we convert stUMEE to the corresponding amount of UMEE base on pool stUMEE/UMEE
            if (coin.denom == "ibc/02F196DA6FD0917DD5FEA249EE61880F4D941EE9059E7964C5C9B50AF103800F") {
                const spotPrice = (await axios.get(`https://lcd.osmosis.zone/osmosis/gamm/v2/pools/1035/prices?base_asset_denom=ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C&quote_asset_denom=${coin.denom}`)).data.spot_price
                coin.denom = "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C" // UMEE 
                coin.amount = coin.amount / spotPrice
            }
            // stEVMOS not be listed on coingecko so we convert stEVMOS to the corresponding amount of EVMOS base on pool stEVMOS/EVMOS
            if (coin.denom == "ibc/C5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01") {
                const spotPrice = (await axios.get(`https://lcd.osmosis.zone/osmosis/gamm/v2/pools/922/prices?base_asset_denom=ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A&quote_asset_denom=${coin.denom}`)).data.spot_price
                coin.denom = "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A" // EVMOS 
                coin.amount = coin.amount / spotPrice
            }
            if (typeof amounts[coin.denom] !== "undefined") {
                amounts[coin.denom] = coin.amount
            } else {
                amounts[coin.denom] += coin.amount
            }
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