const {sumTokens} = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

const ethContracts = [
    {
        name: "F1155 Core",
        address: "0x1Cf24e4eC41DA581bEe223E1affEBB62a5A95484",
        ids: [0, 2, 4]
    },
    {
        name: "F1155 Fuse",
        address: "0xa2d62f8b02225fbFA1cf8bF206C8106bDF4c692b",
        ids: [0, 2]
    },
];

const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const wbtc = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const ftm = "0x4E15361FD6b4BB609Fa63C81A2be19d873717870";

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
    const supplies = await allMarketSupplies(ethContracts, block, "ethereum");

    return {
        [weth]: supplies
    }
}

const fantomContracts = [
    {
        name: "F1155 Core",
        address: "0xB4E2eC87f8E6E166929A900Ed433c4589d721D70",
        ids: [0, 2]
    },
];

async function fantom(_timestamp, ethBlock, chainBlocks){
    const ftmSupplies = await allMarketSupplies(fantomContracts, chainBlocks.fantom, "fantom");
    const wbtcSupplies = await allMarketSupplies([{
        name: "F1155 Core",
        address: "0xB4E2eC87f8E6E166929A900Ed433c4589d721D70",
        ids: [4]
    }], chainBlocks.fantom, "fantom");

    return {
        [ftm]: ftmSupplies,
        [wbtc]: wbtcSupplies,
    }
}

module.exports = {
    ethereum:{
        tvl:eth
    },
    fantom:{
        tvl: fantom
    },
    methodology: "Counts balance of receipt tokens in F1155 Contract on all vaults."
}