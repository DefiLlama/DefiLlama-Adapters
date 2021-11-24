const {getTokenAccountBalance} = require('../helper/solana')

async function staking(){
    const stakedInv = await getTokenAccountBalance("5EZiwr4fE1rbxpzQUWQ6N9ppkEridNwbH3dU3xUf7wPZ")
    return {
        "invictus": stakedInv
    }
}

module.exports={
    solana:{
        tvl: async()=>({}),
        staking
    }
}