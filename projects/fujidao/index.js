const ADDRESSES = require('../helper/coreAssets.json')
const {sumTokens} = require('../helper/unwrapLPs');
const abi = require('./abi.json');
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const {ethereumContracts} = require('./ethereum');
const {fantomContracts} = require('./fantom');
const {polygonContracts} = require('./polygon');
const {arbitrumContracts} = require('./arbitrum');
const {optimismContracts} = require('./optimism');

// const weth = ADDRESSES.ethereum.WETH;
// const wbtc = ADDRESSES.ethereum.WBTC;
// const ftm = ADDRESSES.ethereum.FTM;
// const matic = ADDRESSES.ethereum.MATIC;
// const usdc= ADDRESSES.ethereum.USDC;

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
        [`ethereum:${ADDRESSES.ethereum.WETH}`]: supplies
    }
}

async function fantom(_timestamp, ethBlock, chainBlocks){
    const ftmSupplies = await allMarketSupplies(fantomContracts.fantom, chainBlocks.fantom, "fantom");
    const wbtcSupplies = await allMarketSupplies(fantomContracts.wbtc, chainBlocks.fantom, "fantom");
    const wethSupplies = await allMarketSupplies(fantomContracts.weth, chainBlocks.fantom, "fantom");

    return {
        [`fantom:${ADDRESSES.fantom.WFTM}`]: ftmSupplies,
        [`fantom:${ADDRESSES.fantom.WBTC}`]: wbtcSupplies,
        [`fantom:${ADDRESSES.fantom.WETH}`]: wethSupplies,
    }
}

async function polygon(_timestamp, ethBlock, chainBlocks){
    const maticSupplies = await allMarketSupplies(polygonContracts.matic, chainBlocks.polygon, "polygon");
    const wbtcSupplies = await allMarketSupplies(polygonContracts.wbtc, chainBlocks.polygon, "polygon");
    const wethSupplies = await allMarketSupplies(polygonContracts.weth, chainBlocks.polygon, "polygon");
    const usdcSupplies = await allMarketSupplies(polygonContracts.usdc, chainBlocks.polygon, "polygon");
    console.log(maticSupplies, wbtcSupplies, wethSupplies, usdcSupplies)
    return {
        [`polygon:${ADDRESSES.polygon.WMATIC_2}`]: maticSupplies,
        [`polygon:${ADDRESSES.polygon.WBTC}`]: wbtcSupplies,
        [`polygon:${ADDRESSES.polygon.WETH_1}`]: wethSupplies,
        [`polygon:${ADDRESSES.polygon.USDC_CIRCLE}`]: usdcSupplies,
    }
}

async function arbitrum(_timestamp, ethBlock, chainBlocks){
    const wethSupplies = await allMarketSupplies(arbitrumContracts.weth, chainBlocks.arbirtum, "arbitrum");
    const usdcSupplies = await allMarketSupplies(arbitrumContracts.usdc, chainBlocks.arbirtum, "arbitrum");

    return {
        [`arbitrum:${ADDRESSES.arbitrum.WETH}`]: wethSupplies,
        [`arbitrum:${ADDRESSES.arbitrum.USDC_CIRCLE}`]: usdcSupplies,
    }
}

async function optimism(_timestamp, ethBlock, chainBlocks){
    const wethSupplies = await allMarketSupplies(optimismContracts.weth, chainBlocks.optimism, "optimism");
    const usdcSupplies = await allMarketSupplies(optimismContracts.usdc, chainBlocks.optimism, "optimism");
    return {
        [`optimism:${ADDRESSES.optimism.WETH}`]: wethSupplies,
        [`optimism:${ADDRESSES.optimism.USDC_CIRCLE}`]: usdcSupplies,
    }
}

module.exports = {
    timetravel: false,
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
    optimism: {
        tvl: optimism
    },
}