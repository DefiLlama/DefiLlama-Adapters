const sdk = require('@defillama/sdk');
const getReserves = 'function getReserves() view returns (uint _reserve0, uint _reserve1)'
const token0Abi = 'address:token0'
const token1Abi = 'address:token1'
const lpReservesAbi = 'function getReserves() view returns (uint _reserve0, uint _reserve1)'
const lpSuppliesAbi = "uint256:totalSupply"

const { default: BigNumber } = require('bignumber.js');
const { getChainTransform, getFixBalances, } = require('../helper/portedTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { requery } = require('../helper/requery')
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

function stakingUnknownPricedLPInSyncSwap(stakingContract, stakingToken, chain, lpContract, coingeckoIdOfPairedToken, decimals) {
    let transform = ()=>coingeckoIdOfPairedToken;
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
        console.log(balances);
        const fixBalances = await getFixBalances(chain)
        console.log(fixBalances)
        fixBalances(balances)
        console.log(balances)

        return balances
    }
}

function pool2sEthereum(stakingContracts, lpTokens, titiPair, chain = "ethereum", transformAddress = undefined) {
    return async (_timestamp, _ethBlock, _, { api }) =>  {
        chain = api.chain ?? chain
        const block = api.block
        const balances = {}
        let transform = transformAddress
        if (transform === undefined) {
            transform = addr => `${chain}:${addr}`
        }
        await sumTokensAndLPsSharedOwners(balances, lpTokens.map(token => [token, true]), stakingContracts, block, chain, transform);

        const [titiReserveAmounts] = await Promise.all([
            ...[getReserves].map(abi=>sdk.api.abi.call({
                target: titiPair,
                abi,
                chain,
                block
            }).then(o=>o.output))
        ])
        let stakedBal;
        
        let titiBal = balances['ethereum:0x3bdffa70f4b4e6985eed50453c7c0d4a15dcec52'];
        let tiusdBal = balances['ethereum:0x6eff556748ee452cbdaf31bcb8c76a28651509bd'];

        let titiValue = BigNumber(titiBal).times(titiReserveAmounts[1]).times(BigNumber(10**12)).div(titiReserveAmounts[0]);
        let tiusdValue = BigNumber(tiusdBal);

        stakedBal = Number(titiValue.plus(tiusdValue))/(10**18);

        balances['usd-coin'] = stakedBal;
        console.log(balances)
        const fixBalances = await getFixBalances(chain)
        console.log(fixBalances)
        fixBalances(balances)
        console.log(balances)

        return balances
    }
}

function pool2sEra(stakingContracts, lpTokens, titiPair, chain = "era", transformAddress = undefined) {
    return async (_timestamp, _ethBlock, _, { api }) =>  {
        chain = api.chain ?? chain
        const block = api.block
        const balances = {}
        let transform = transformAddress
        if (transform === undefined) {
            transform = addr => `${chain}:${addr}`
        }

        await sumTokensAndLPsSharedOwnersInSyncswap(balances, lpTokens.map(token => [token, true]), stakingContracts, block, chain, transform);

        const [titiReserveAmounts] = await Promise.all([
            ...[getReserves].map(abi=>sdk.api.abi.call({
                target: titiPair,
                abi,
                chain,
                block
            }).then(o=>o.output))
        ])
        let stakedBal;
        
        console.log(titiReserveAmounts);
        let titiBal = balances['era:0x4ebfb78c4780c304dff7de518db630b67e3f044b'];
        let tiusdBal = balances['era:0xc059767cb62f003e863f9e7bd1fc813beff9693c'];

        let titiValue = BigNumber(titiBal).times(titiReserveAmounts[0]).times(BigNumber(10**12)).div(titiReserveAmounts[1]);
        let tiusdValue = BigNumber(tiusdBal);

        stakedBal = Number(titiValue.plus(tiusdValue))/(10**18);

        balances['usd-coin'] = stakedBal;
        console.log(balances)
        const fixBalances = await getFixBalances(chain)
        console.log(fixBalances)
        fixBalances(balances)
        console.log(balances)

        return balances
    }
}

async function sumTokensAndLPsSharedOwnersInSyncswap(balances, tokens, owners, block, chain = "era", transformAddress) {
    if (!transformAddress)
      transformAddress = await getChainTransform(chain)
    const balanceOfTokens = await sdk.api.abi.multiCall({
      calls: tokens.map(t => owners.map(o => ({
        target: t[0],
        params: o
      }))).flat(),
      abi: 'erc20:balanceOf',
      block,
      chain
    })
    await requery(balanceOfTokens, chain, block, 'erc20:balanceOf')
    const isLP = {}
    tokens.forEach(token => {
      isLP[token[0].toLowerCase()] = token[1]
    })
    const lpBalances = []
    
    balanceOfTokens.output.forEach((result, idx) => {
      const token = result.input.target.toLowerCase()
      const balance = result.output
      if (isLP[token] === true) {
        lpBalances.push({
          token,
          balance
        })
      } else {
        sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
      }
    })
    if (lpBalances.length > 0) {
      await unwrapSyncswapLPs(balances, lpBalances, block, chain, transformAddress)
    }
}

async function unwrapSyncswapLPs(balances, lpPositions, block, chain = 'era', transformAddress = null, excludeTokensRaw = [], retry = false, uni_type = 'standard',) {
    if (!transformAddress)
      transformAddress = await getChainTransform(chain)
    const api = new sdk.ChainApi({ chain, block })
    lpPositions = lpPositions.filter(i => +i.balance > 0)
    const excludeTokens = excludeTokensRaw.map(addr => addr.toLowerCase())
    const lpTokenCalls = lpPositions.map(i => i.token)
    const [
      lpReserves, lpSupplies, tokens0, tokens1,
    ] = await Promise.all([
      uni_type === 'standard' ? api.multiCall({ abi: lpReservesAbi, calls: lpTokenCalls, }) : null,
      api.multiCall({ abi: lpSuppliesAbi, calls: lpTokenCalls, }),
      api.multiCall({ abi: token0Abi, calls: lpTokenCalls, }),
      api.multiCall({ abi: token1Abi, calls: lpTokenCalls, }),
    ])

    lpPositions.map((lpPosition, i) => {
      const token0 = tokens0[i].toLowerCase()
      const token1 = tokens1[i].toLowerCase()
      const supply = lpSupplies[i]
  
      if (supply === "0") {
        return
      }
  
      let _reserve0, _reserve1
      if (uni_type === 'standard') {
        _reserve0 = lpReserves[i]._reserve0
        _reserve1 = lpReserves[i]._reserve1
      } 
  
      const ratio = lpPosition.balance / supply
      if (!excludeTokens.includes(token0)) {
        sdk.util.sumSingleBalance(balances, transformAddress(token0), ratio * _reserve0)
      }
      if (!excludeTokens.includes(token1)) {
        sdk.util.sumSingleBalance(balances, transformAddress(token1), ratio * _reserve1)
      }
    })
}
  

module.exports = {
    stakingUnknownPricedLPInSyncSwap,
    pool2sEthereum,
    pool2sEra
}
