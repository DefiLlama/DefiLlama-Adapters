const sdk = require('@defillama/sdk');
const { getBlock } = require('./getBlock');

function staking(stakingContract, stakingToken, chain="ethereum", transformedTokenAddress=undefined, decimals=undefined){
    return async (timestamp, _ethBlock, chainBlocks)=>{
        const block = await getBlock(timestamp, chain, chainBlocks)
        const bal = await sdk.api.erc20.balanceOf({
            target: stakingToken,
            owner: stakingContract,
            chain,
            block,
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