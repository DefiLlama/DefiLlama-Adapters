const {sumTokens} = require('../helper/unwrapLPs');
const abi = require('./abi.json');
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const {ethereumContracts} = require('./ethereum');
const {fantomContracts} = require('./fantom');
const {polygonContracts} = require('./polygon');
const {arbitrumContracts} = require('./arbitrum');

const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const wbtc = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const ftm = "0x4E15361FD6b4BB609Fa63C81A2be19d873717870";
const matic = '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0';
const usdc= "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const marketsupply = async (contract, block, chain) => {
    return await sdk.api.abi.multiCall(
        {
            abi: abi.totalSupply,
            calls: (contract.ids).map( id => ({
                target:(contract.address),
                params: [id]
            })),
            block,
            chain
        }
    );
}

const allMarketSupplies = async (contracts, block, chain) => {
    let allMarkets;
    for (let index = 0; index < contracts.length; index++) {
        if (!allMarkets) {
            allMarkets = await marketsupply(contracts[index], block, chain);
        } else {
            let temp = allMarkets.output;
            let response = await marketsupply(contracts[index], block, chain);
            response = response.output;
            allMarkets.output = temp.concat(response);
        } 
    }
    return allMarkets.output.reduce((t,v) => t.plus(v.output), BigNumber(0)).toFixed(0);
}

async function eth(_timestamp, block){
    const supplies = await allMarketSupplies(ethereumContracts.weth, block, "ethereum");

    return {
        [weth]: supplies
    }
}

async function fantom(_timestamp, ethBlock, chainBlocks){
    const ftmSupplies = await allMarketSupplies(fantomContracts.fantom, chainBlocks.fantom, "fantom");
    const wbtcSupplies = await allMarketSupplies(fantomContracts.wbtc, chainBlocks.fantom, "fantom");
    const wethSupplies = await allMarketSupplies(fantomContracts.weth, chainBlocks.fantom, "fantom");

    return {
        [ftm]: ftmSupplies,
        [wbtc]: wbtcSupplies,
        [weth]: wethSupplies,
    }
}

async function polygon(_timestamp, ethBlock, chainBlocks){
    const maticSupplies = await allMarketSupplies(polygonContracts.matic, chainBlocks.polygon, "polygon");
    const wbtcSupplies = await allMarketSupplies(polygonContracts.wbtc, chainBlocks.polygon, "polygon");
    const wethSupplies = await allMarketSupplies(polygonContracts.weth, chainBlocks.polygon, "polygon");
    const usdcSupplies = await allMarketSupplies(polygonContracts.usdc, chainBlocks.polygon, "polygon");

    return {
        [matic]: maticSupplies,
        [wbtc]: wbtcSupplies,
        [weth]: wethSupplies,
        [usdc]: usdcSupplies,
    }
}

async function arbitrum(_timestamp, ethBlock, chainBlocks){
    const wethSupplies = await allMarketSupplies(arbitrumContracts.weth, chainBlocks.arbirtum, "arbitrum");
    const usdcSupplies = await allMarketSupplies(arbitrumContracts.usdc, chainBlocks.arbirtum, "arbitrum");

    return {
        [weth]: wethSupplies,
        [usdc]: usdcSupplies,
    }
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: false,
    methodology: "Counts on-chain balance of receipt tokens in F1155 contracts for all vaults.",
    ethereum:{
        tvl:eth
    },
    fantom:{
        tvl: fantom
    },
    polygon: {
        tvl: polygon
    },
    arbitrum: {
        tvl: arbitrum
    },
}