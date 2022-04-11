const axios = require('axios')

async function staking(){
    const aadaLocked = (await axios.get("https://cardano-mainnet.blockfrost.io/api/v0/addresses/addr1wyvej5rmcrhfpcwrwmnqsjtwvf8gv3dn64vwy3xzekp95wqqhdkwa", {
        headers:{
            project_id: "mainnetTV9qV3mfZXbE6e44TVGMe1UoRlLrpSQt"
        }
    })).data.amount.find(token=>token.unit==="8fef2d34078659493ce161a6c7fba4b56afefa8535296a5743f6958741414441").quantity;


    const topPrice = (await axios.get("https://orders.muesliswap.com/orderbook/?policy-id=8fef2d34078659493ce161a6c7fba4b56afefa8535296a5743f69587&tokenname=AADA")
  ).data.buy[0].price;
    
    return {
        cardano: aadaLocked * topPrice
    }
}

module.exports={
    misrepresentedTokens: true,
    methodology: 'Counts amount of AADA staked; by a price of ADA sitting in the orderbook.',
    timetravel: false,
    cardano:{
        staking,
        tvl:()=>({}),
    }
}
