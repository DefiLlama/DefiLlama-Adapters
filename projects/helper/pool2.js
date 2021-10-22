const { sumTokensAndLPs, sumTokensAndLPsSharedOwners } = require('./unwrapLPs')
const {_BASE_TOKEN_, _QUOTE_TOKEN_} = require('./abis/dodo.json')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

function pool2(stakingContract, lpToken, chain = "ethereum", transformAddress) {
    return async (_timestamp, _ethBlock, chainBlocks) => {
        const balances = {}
        if(transformAddress === undefined){
            transformAddress = addr=>`${chain}:${addr}`
        }
        await sumTokensAndLPs(balances, [[lpToken, stakingContract, true]], chainBlocks[chain], chain, transformAddress)
        return balances
    }
}

function pool2s(stakingContracts, lpTokens, chain = "ethereum", transformAddress = undefined){
    return async (_timestamp, _ethBlock, chainBlocks) => {
        const balances = {}
        let transform = transformAddress
        if(transform === undefined){
            transform = addr=>`${chain}:${addr}`
        }
        await sumTokensAndLPsSharedOwners(balances, lpTokens.map(token=>[token, true]), stakingContracts, chainBlocks[chain], chain, transform)
        return balances
    }
}

function pool2Exports(stakingContract, lpTokens, chain, transformAddress) {
    return {
        tvl: pool2s([stakingContract], lpTokens, chain, transformAddress)
    }
}

function dodoPool2(stakingContract, lpToken, chain = "ethereum", transformAddress=addr=>addr) {
    return async (_timestamp, _ethBlock, chainBlocks) => {
        const balances = {}
        const block = chainBlocks[chain]
        const [baseToken, quoteToken, totalSupply] = await Promise.all([_BASE_TOKEN_, _QUOTE_TOKEN_, "erc20:totalSupply"].map(abi => sdk.api.abi.call({
            target: lpToken,
            chain,
            block,
            abi
        }).then(r=>r.output)))
        const [baseTokenBalance, quoteTokenBalance, stakedLPBalance] = await Promise.all([
            [baseToken, lpToken], [quoteToken, lpToken], [lpToken, stakingContract]
        ].map(token => sdk.api.abi.call({
            target: token[0],
            params: [token[1]],
            chain,
            block,
            abi: 'erc20:balanceOf'
        }).then(r=>r.output)))
        sdk.util.sumSingleBalance(balances, baseToken, BigNumber(baseTokenBalance).times(stakedLPBalance).div(totalSupply).toFixed(0))
        sdk.util.sumSingleBalance(balances, quoteToken, BigNumber(quoteTokenBalance).times(stakedLPBalance).div(totalSupply).toFixed(0))
        return balances
    }
}

module.exports = {
    pool2,
    pool2Exports,
    dodoPool2,
    pool2s
}