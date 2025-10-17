
const ADDRESSES = require('../helper/coreAssets.json')
const axios = require('axios')

const API_URL_COMPLEX = `https://api.marquee.fi/api/client/indexdata`

async function tvl() {

    const data = await axios.get(API_URL_COMPLEX, {
        headers: {
            'accept': 'application/json'
        },
    }).then(r => r.data.data.tvl*1000000)

    return {
        [ADDRESSES.ethereum.USDT]: Number(data)
    }
}

module.exports = {
    arbitrum: {
        tvl
    }
}
