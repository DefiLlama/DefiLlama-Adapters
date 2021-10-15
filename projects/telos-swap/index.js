const axios = require('axios')

async function tvl(){
    const data = await axios.post("https://telos.caleos.io/v1/chain/get_table_rows", {
        "json":true,"code":"data.tbn","scope":"data.tbn","table":"tradedata","table_key":"","lower_bound":"","upper_bound":"","index_position":1,"key_type":"","limit":100,"reverse":false,"show_payer":false
    })
    let tvlTlos = 0;
    data.data.rows.forEach(row=>{
        row.liquidity_depth.forEach(token=>{
            if(token.key === "TLOS"){
                tvlTlos += Number(token.value.split(' ')[0])*2
            }
        })
    })
    return {
        telos: tvlTlos
    }
}

module.exports={
    methodology: 'TVL is the liquidity on the AMM.',
    tvl
}
