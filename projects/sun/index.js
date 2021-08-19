const sdk = require('@defillama/sdk')
const {getTokenBalance, getTrxBalance, unverifiedCall} = require('../helper/tron')

const pool3 = "TKcEU8ekq2ZoFzLSGFYCUY6aocJBX9X31b"
const stablecoins = [
    ["TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "tether"], // USDT
    ["TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT", "just-stablecoin"], // USDJ
    ["TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4", "true-usd"] // TUSD 
]

async function tvl() {
    const balances = {}
    await Promise.all(stablecoins.map(async stable=>{
        balances[stable[1]] = await getTokenBalance(stable[0], pool3)
    }))
    return balances
}

const stakingContract = "TXbA1feyCqWAfAQgXvN1ChTg82HpBT8QPb"
const sun = "TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S"
async function staking() {
    return {
        "sun-token": await getTokenBalance(sun, stakingContract)
    }
}

const lpToken = 'TDQaYrhQynYV9aXTYj63nwLAafRffWSEj6'
const lpStaking = "TGsymdggp98tLKZWGHcGX58TjTcaQr9s4x"

async function pool2() {
    const [lpTokenAmount, sunInLp, trxInLp, totalSupply] = await Promise.all([
        getTokenBalance(lpToken, lpStaking),
        getTokenBalance(sun, lpToken),
        getTrxBalance(lpToken),
        unverifiedCall(lpToken, 'totalSupply()', [])
    ])
    return {
        "sun-token": sunInLp*lpTokenAmount/(totalSupply/10**6),
        "tron": trxInLp*lpTokenAmount/totalSupply,
    }
}


module.exports = {
    tron: {
        tvl
    },
    staking:{
        tvl:staking
    },
    pool2:{
        tvl:pool2
    },
    tvl
}
