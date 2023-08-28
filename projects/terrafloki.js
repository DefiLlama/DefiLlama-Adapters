const {toUSDTBalances} = require('./helper/balances')
const { get } = require('./helper/http')

async function pool2() {
    var res = await get("https://api.terrafloki.io/defi-llama/trade-pair-llp")
    return toUSDTBalances(parseFloat(res));
}

async function staking() {
    var res = await get("https://api.terrafloki.io/defi-llama/ticket-farming-tfloki")
    return toUSDTBalances(parseFloat(res));
}

async function tvl() {
    var res = await get("https://api.terrafloki.io/defi-llama/ticket-farming-llp")
    return toUSDTBalances(parseFloat(res));
}

module.exports = {
    terra:{        
        tvl: () => 0
    },
    hallmarks:[
    [1651881600, "UST depeg"],
  ]
}; 
