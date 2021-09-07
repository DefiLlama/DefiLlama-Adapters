const utils = require('./helper/utils')

async function fetch(){
    const tvl = await utils.fetchURL("https://public1.nuls.io/nuls/tvl")
    return Number(tvl.data.tvl)
}

module.exports={
    methodology: 'TVL counts native chain staking and data is pulled from: "https://public1.nuls.io/nuls/tvl".',
    fetch,
}