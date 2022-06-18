const sdk = require("@defillama/sdk");
const {transformPolygonAddress} = require('../helper/portedTokens');
const { staking } = require("../helper/staking");
const totalBalanceABI = require('./abi/vault.json')
const _ = require('underscore');

const insuranceFund = "0x809F76d983768846acCbD8F8C9BDc240dC39bf8B"
const manager = "0xeC5ae95D4e9288a5C7c744F278709C56e9dC34eD"
const usdcMatic = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
const wethMatic = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"
const wbtcMatic = "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"
const stakingAddress = "0xb88cc657d93979495045e9f204cec2eed265ed42"
const usdcAssetVaults = [
    "0x26dde715023d8acb57f6702731b569c160e2a3fb",
    "0xAefA2EF8c02e39DAA310F5CAdAE3a35B198ff38B"
]

const ethAssetVaults = [
    "0xBbC6561d382bC45d81Fdb3581D76047f15825D53"
]

const btcAssetVaults = [
    "0x3728afb2dab6A6D0507f5536F9601F0956154355"
]

async function tvl(_timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const usdc = await (await transformPolygonAddress())(usdcMatic);
    const weth = await (await transformPolygonAddress())(wethMatic);
    const wbtc = await (await transformPolygonAddress())(wbtcMatic);

    //TVL for Perpetuals
    const underlyingBalances = await sdk.api.abi.multiCall({
        calls: [{
            target: usdcMatic,
            params: insuranceFund
        },{
            target: usdcMatic,
            params: manager
        },{
            target: usdcMatic,
            params: stakingAddress
        }],
        block: chainBlocks.polygon,
        abi: "erc20:balanceOf",
        chain: 'polygon'
    });
    
    _.each(underlyingBalances.output, (ub)=>{
        sdk.util.sumSingleBalance(balances, usdc, ub.output)    
    })
    

    //TVL for USDC DOV vaults
    const totalBalances = await sdk.api.abi.multiCall({
        calls: _.map(usdcAssetVaults, (address) => ({
            target: address
          })),
        abi: totalBalanceABI['totalBalance'],        
        block: chainBlocks.polygon,        
        chain: 'polygon'
    })

    _.each(totalBalances.output, (totalBalanceVault)=>{
        sdk.util.sumSingleBalance(balances, usdc, totalBalanceVault.output)
    })
    
    //TVL for ETH DOV vaults
    const totalBalancesETH = await sdk.api.abi.multiCall({
        calls: _.map(ethAssetVaults, (address) => ({
            target: address
          })),
        abi: totalBalanceABI['totalBalance'],        
        block: chainBlocks.polygon,        
        chain: 'polygon'
    })

    _.each(totalBalancesETH.output, (totalBalanceVault)=>{
        sdk.util.sumSingleBalance(balances, weth, totalBalanceVault.output)
    })

    //TVL for BTC DOV vaults
    const totalBalancesBTC = await sdk.api.abi.multiCall({
        calls: _.map(btcAssetVaults, (address) => ({
            target: address
          })),
        abi: totalBalanceABI['totalBalance'],        
        block: chainBlocks.polygon,        
        chain: 'polygon'
    })

    _.each(totalBalancesBTC.output, (totalBalanceVault)=>{
        sdk.util.sumSingleBalance(balances, wbtc, totalBalanceVault.output)
    })
        
    return balances
}

module.exports = {    
    polygon: {
        tvl: tvl        
    }    
}