const utils = require('../helper/utils')

const pair = "KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5"

async function tvl(){
    const btc = await utils.fetchURL("https://api.tzkt.io/v1/contracts/KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5/storage")
    const xtz = await utils.fetchURL("https://rpc.tzbeta.net/chains/main/blocks/head/context/contracts/KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5/balance")

    return {
        "bitcoin": Number(btc.data.tokenPool)/1e8,
        "tezos": Number(xtz.data)/1e6,
    }
}

module.exports={
    tezos: {
        tvl,
    },
    
    methodology: "Liquidity on tezos' tzBTC-XTZ pair"
}