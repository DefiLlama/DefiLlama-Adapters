const { post } = require("../helper/http")

async function tvl() {
    const neoLocked = await post("https://n3seed1.ngd.network:10332", 
        { "params": ["0x48c40d4666f93408be1bef038b6722404d9a4c2a", "totalSupply", []], "method": "invokefunction", "jsonrpc": "2.0", "id": 1 }
    )
    return {
        "neo": neoLocked['result']['stack'][0]['value'] / 1e8
    }
}

module.exports={
    neo:{
        tvl
    }
}