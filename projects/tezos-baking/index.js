const utils = require('../helper/utils')

const pair = "KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5"

async function tvl(){
    const btc = await utils.fetchURL("https://api.better-call.dev/v1/contract/mainnet/KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn/tokens/holders?token_id=0")
    const xtz = await utils.fetchURL("https://rpc.tzbeta.net/chains/main/blocks/head/context/contracts/KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5/balance")

    return {
        "bitcoin": btc.data[pair]/1e8,
        "tezos": Number(xtz.data)/1e6,
    }
}

module.exports={
    tvl,
    methodology: "Liquidity on tezos' tzBTC-XTZ pair"
}