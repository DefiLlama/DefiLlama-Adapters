const sdk = require('@defillama/sdk');
const getReserves = require('./abis/getReserves.json');
const token0Abi = require('./abis/token0.json');
const token1Abi = require('./abis/token1.json');
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform, getFixBalances, } = require('./portedTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')


function staking(stakingContract, stakingToken, chain = "ethereum", transformedTokenAddress = undefined, decimals = undefined) {
    if (!Array.isArray(stakingContract))  stakingContract = [stakingContract]
    if (!Array.isArray(stakingToken))  stakingToken = [stakingToken]
    return stakings(stakingContract, stakingToken, chain, transformedTokenAddress, decimals)
}

function stakings(stakingContracts, stakingToken, chain = "ethereum", transformedTokenAddress = undefined, decimals = undefined) {
    return async (timestamp, _ethBlock, {[chain]: block}) => {
        if (!Array.isArray(stakingToken))  stakingToken = [stakingToken]
        let transformAddress = transformedTokenAddress
        if (typeof transformedTokenAddress === 'string') transformAddress = i => transformedTokenAddress
        const balances = await sumTokens2({ chain, block, tokens: stakingToken, owners: stakingContracts, transformAddress, })
        
        if (decimals) {
            Object.keys(balances).forEach(key => {
                balances[key] = BigNumber(balances[key]/ (10 ** decimals)).toFixed(0)
            })
        }
        return balances
    }
}

function stakingPricedLP(stakingContract, stakingToken, chain, lpContract, coingeckoIdOfPairedToken, stakedTokenIsToken0 = false, decimals=18) {
    return stakingUnknownPricedLP(stakingContract, stakingToken, chain, lpContract, ()=>coingeckoIdOfPairedToken, decimals)
}

function stakingUnknownPricedLP(stakingContract, stakingToken, chain, lpContract, transform, decimals) {
    return async (timestamp, _ethBlock, {[chain]: block}) => {
        if (!transform)   transform = await getChainTransform(chain)

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

        const balances = {
            [transform(token)]: stakedBal
        }

        const fixBalances = await getFixBalances(chain)
        fixBalances(balances)

        return balances
    }
}

module.exports = {
    staking,
    stakings,
    stakingPricedLP,
    stakingUnknownPricedLP
}
