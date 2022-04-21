const {getTokenAccountBalance} = require('./helper/solana')

async function tvl(){
    const usdcLocked = await getTokenAccountBalance("6W9yiHDCW9EpropkFV8R3rPiL8LVWUHSiys3YeW6AT6S")
    const liqInsurance = await getTokenAccountBalance("Bzjkrm1bFwVXUaV9HTnwxFrPtNso7dnwPQamhqSxtuhZ")
    const totalTvl = liqInsurance + usdcLocked
    return {
        "usd-coin": totalTvl
    }
}

module.exports={
    timetravel: false,
    methodology: "Calculate the USDC on 6W9yiHDCW9EpropkFV8R3rPiL8LVWUHSiys3YeW6AT6S through on-chain calls & add the USDC on Bzjkrm1bFwVXUaV9HTnwxFrPtNso7dnwPQamhqSxtuhZ which is the insurance fund for liquidations",
    solana:{
        tvl
    }
}
