const axios = require('axios')

async function tvl(){
    const amount = (await axios.get("https://api.cardance.finance/dance/dex/balance")).data.value
    return {
        "cardano":amount
    }
}

module.exports={
    timetravel: false,
    cardano:{
        tvl
    }
}
