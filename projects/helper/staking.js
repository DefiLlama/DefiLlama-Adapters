const sdk = require('@defillama/sdk')

module.exports = function(stakingContract, stakingToken, chain="ethereum", transformedTokenAddress=undefined){
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
        return {
            [address]: bal.output
        }
    }
}