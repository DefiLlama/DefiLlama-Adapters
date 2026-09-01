const { PromisePool } = require('@supercharge/promise-pool')
const { getAddressesUTXOs, getTxsMetadata } = require("../helper/chain/cardano/blockfrost")

const scriptAddress = "addr1wxwrp3hhg8xdddx7ecg6el2s2dj6h2c5g582yg2yxhupyns8feg4m"

const tvl = async () => {

    const utxos = await getAddressesUTXOs(scriptAddress)
    let totalLovelaceLocked = 0
    
    await PromisePool
        .for(utxos)
        .withConcurrency(10)
        .process( async (utxo) => {

        const metadata = await getTxsMetadata(utxo.tx_hash)
        totalLovelaceLocked += metadata.reduce((p, c) => {
            let v = 0
            if (c.label == 1) { // all loans have label == 1
                v = parseInt(c?.json_metadata?.Listing?.Principal)
            }
            return p + v
        }, 0)
    })

    return {
        cardano: totalLovelaceLocked / 1e6,
    }
}

module.exports = {
    timetravel: false,
    cardano: {
      tvl,
    },
}