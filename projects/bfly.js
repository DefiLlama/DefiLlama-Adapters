const { default: axios } = require("axios")

async function fetch_price(){
    return (await axios.post("https://main-seed.starcoin.org",
        {
            id: 101,
            jsonrpc: "2.0",
            method: "contract.call_v2",
            params: [
                {
                    function_id: "0x1::PriceOracle::read",
                    args: ["0x82e35b34096f32c42061717c06e44a59"],
                    type_args: ["0x1::STCUSDOracle::STCUSD"]
                }]
        })).data.result[0]
}

async function fetch_amount(){
    return (await axios.post("https://main-seed.starcoin.org",
        {
            id: 101,
            jsonrpc: "2.0",
            method: "contract.call_v2",
            params: [{
                function_id: "0x4ffcc98f43ce74668264a0cf6eebe42b::STCVaultPoolA::current_stc_locked",
                args: [],
                type_args: []
            }]
        })).data.result
}
async function tvl() {
    const tvl = (await fetch_amount()) /1000000000 * (await fetch_price()) /1000000
    return {
        tether: tvl
    }
}


module.exports={
    methodology: "Data is retrieved from the api at https://fai.bfly.finance",
    misrepresentedTokens: true,
    timetravel: false,
    starcoin: {
        tvl,
    }
}
