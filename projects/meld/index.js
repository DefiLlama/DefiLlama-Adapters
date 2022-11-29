const axios = require('axios')

async function staking(){
    const meldLocked = (await axios.get("https://cardano-mainnet.blockfrost.io/api/v0/addresses/addr1wxar2qwdzuxfvdyuxsk9aapy93vkkk904mxullqtkp90pmqh0xrmz", {
        headers:{
            project_id: "mainnetTV9qV3mfZXbE6e44TVGMe1UoRlLrpSQt"
        }
    })).data.amount.find(token=>token.unit==="6ac8ef33b510ec004fe11585f7c5a9f0c07f0c23428ab4f29c1d7d104d454c44").quantity
    return {
        "meld": meldLocked/1e6
    }
}

module.exports={
    timetravel: false,
    cardano:{
        staking,
        tvl:()=>({}),
    }
}
