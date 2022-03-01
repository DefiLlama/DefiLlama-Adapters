const axios = require('axios')

async function tvl(){
    const ammLocked = (await axios.get("https://cardano-mainnet.blockfrost.io/api/v0/addresses/addr1vxs9zqu2lcddy98wml0d7qtpfy2m7shtz0gzkj93ghgkckg373c0h", {
        headers:{
            project_id: "mainnetTV9qV3mfZXbE6e44TVGMe1UoRlLrpSQt"
        }
    })).data.amount.find(token=>token.unit==="lovelace").quantity
    return {
        "cardano": ammLocked/1e6
    }
}

module.exports={
    timetravel: false,
    cardano:{
        tvl
    }
}
