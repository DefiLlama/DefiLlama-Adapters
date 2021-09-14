const {sumTokensAndLPs} = require('./unwrapLPs')

function pool2(stakingContract, lpToken, chain="ethereum", transformAddress=id=>id){
    return async (_timestamp, _ethBlock, chainBlocks)=>{
        const balances = {}
        await sumTokensAndLPs(balances, [[lpToken, stakingContract, true]], chainBlocks[chain], chain, transformAddress)
        return balances
    }
}

module.exports ={
    pool2
}