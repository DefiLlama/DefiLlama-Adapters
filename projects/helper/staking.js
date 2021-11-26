const sdk = require('@defillama/sdk');
const { getBlock } = require('./getBlock');
const getReserves = require('./abis/getReserves.json');
const token0Abi = require('./abis/token0.json');
const token1Abi = require('./abis/token1.json');
const { default: BigNumber } = require('bignumber.js');

function staking(stakingContract, stakingToken, chain = "ethereum", transformedTokenAddress = undefined, decimals = undefined) {
    return async (timestamp, _ethBlock, chainBlocks) => {
        const block = await getBlock(timestamp, chain, chainBlocks)
        const bal = await sdk.api.erc20.balanceOf({
            target: stakingToken,
            owner: stakingContract,
            chain,
            block,
        })
        let address = stakingToken;
        if (transformedTokenAddress) {
            address = transformedTokenAddress
        } else if (chain !== "ethereum") {
            address = `${chain}:${stakingToken}`
        }
        if (decimals !== undefined) {
            return {
                [address]: Number(bal.output) / (10 ** decimals)
            }
        }
        return {
            [address]: bal.output
        }
    }
}

function stakingPricedLP(stakingContract, stakingToken, chain, lpContract, coingeckoIdOfPairedToken, stakedTokenIsToken0 = false, decimals=18) {
    return stakingUnknownPricedLP(stakingContract, stakingToken, chain, lpContract, ()=>coingeckoIdOfPairedToken, decimals)
}

function stakingUnknownPricedLP(stakingContract, stakingToken, chain, lpContract, transform, decimals) {
    return async (timestamp, _ethBlock, chainBlocks) => {
        const block = await getBlock(timestamp, chain, chainBlocks, true)
        const [bal, reserveAmounts, token0, token1] = await Promise.all([
            sdk.api.erc20.balanceOf({
                target: stakingToken,
                owner: stakingContract,
                chain,
                block,
            }),
            ...[getReserves, token0Abi, token1Abi].map(abi=>sdk.api.abi.call({
                target: lpContract,
                abi,
                chain,
                block
            }).then(o=>o.output))
        ])
        let token, stakedBal;
        if(token0.toLowerCase() === stakingToken.toLowerCase()){
            token = token1;
            stakedBal = BigNumber(bal.output).times(reserveAmounts[1]).div(reserveAmounts[0]).toFixed(0);
        }else {
            stakedBal = BigNumber(bal.output).times(reserveAmounts[0]).div(reserveAmounts[1]).toFixed(0);
            token = token0
        }
        if(decimals !== undefined){
            stakedBal = Number(stakedBal)/(10**decimals)
        }
        return {
            [transform?transform(token):`${chain}:${token}`]: stakedBal
        }
    }
}

module.exports = {
    staking,
    stakingPricedLP,
    stakingUnknownPricedLP
}
