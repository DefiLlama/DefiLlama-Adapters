const sdk = require('@defillama/sdk');
const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
const token0Abi = 'address:token0'
const token1Abi = 'address:token1'
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform, getFixBalances, } = require('./portedTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')


function staking(stakingContract, stakingToken, _chain = "ethereum", transformedTokenAddress = undefined, decimals = undefined) {
    if (!Array.isArray(stakingContract))  stakingContract = [stakingContract]
    if (!Array.isArray(stakingToken))  stakingToken = [stakingToken]
    return stakings(stakingContract, stakingToken, _chain, transformedTokenAddress, decimals)
}

function stakings(stakingContracts, stakingToken, _chain = "ethereum", transformedTokenAddress = undefined, decimals = undefined) {
    return async (_, _b, cb, { chain, block } = {}) => {

        if (!chain) {
          chain = _chain
          block = cb[chain]
        }

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
        if (!transform)   transform = getChainTransform(chain)

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

        const fixBalances = getFixBalances(chain)
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
