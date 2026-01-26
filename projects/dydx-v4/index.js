const { get } = require("../helper/http");

async function tvl(){
    const data = await get("https://dydx-ops-rest.kingnodes.com/cosmos/bank/v1beta1/supply/by_denom?denom=ibc%2F8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5")
    return {
        "usd-coin": data.amount.amount/1e6
    }
}

module.exports={
    hallmarks: [
        [1731974400,"dYdX Unlimited launch"]
    ],
    dydx:{
        tvl
    }
}