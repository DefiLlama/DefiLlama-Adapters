const sdk = require('@defillama/sdk')

function staking(stakingContract, stakingToken, chain="ethereum", transformedTokenAddress=undefined, decimals=undefined){
    return async (_timestamp, _ethBlock, chainBlocks)=>{
        const bal = await sdk.api.erc20.balanceOf({
            target: stakingToken,
            owner: stakingContract,
            chain,
            block: chainBlocks[chain]
        })
        let address = stakingToken;
        if(transformedTokenAddress){
            address = transformedTokenAddress
        } else if(chain !== "ethereum"){
            address = `${chain}:${stakingToken}`
        }
        if(decimals !== undefined){
            return{
                [address]: Number(bal.output)/(10**decimals)
            }
        }
        return {
            [address]: bal.output
        }
    }
}

module.exports={
    staking
}