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

function stakingPricedLP(stakingContract, stakingToken, chain, lpContract, coingeckoIdOfPairedToken, stakedTokenIsToken0 = false, decimals = 18) {
    return async (timestamp, _ethBlock, chainBlocks) => {
        const block = await getBlock(timestamp, chain, chainBlocks, true)
        const [bal, reserveAmounts] = await Promise.all([
            sdk.api.erc20.balanceOf({
                target: stakingToken,
                owner: stakingContract,
                chain,
                block,
            }),
            sdk.api.abi.call({
                target: lpContract,
                abi: getReserves,
                chain,
                block
            })
        ])
        const price = stakedTokenIsToken0 ?
            Number(reserveAmounts.output[1]) / Number(reserveAmounts.output[0]) : Number(reserveAmounts.output[0]) / Number(reserveAmounts.output[1])
        return {
            [coingeckoIdOfPairedToken]: (Number(bal.output) / (10 ** decimals)) * price
        }
    }
}

function stakingUnknownPricedLP(stakingContract, stakingToken, chain, lpContract, transform) {
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
        if(token0.toLowerCase() === stakingToken.toLowerCase()){
            return {
                [transform?transform(token1):`${chain}:${token1}`]: BigNumber(bal.output).times(reserveAmounts[1]).div(reserveAmounts[0]).toFixed(0)
            }
        }else {
            return {
                [transform?transform(token0):`${chain}:${token0}`]: BigNumber(bal.output).times(reserveAmounts[0]).div(reserveAmounts[1]).toFixed(0)
            }
        }
    }
}

module.exports = {
    staking,
    stakingPricedLP,
    stakingUnknownPricedLP
}
