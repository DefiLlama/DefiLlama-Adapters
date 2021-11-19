const {sumTokens} = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

const contracts = [
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

async function tvl(_timestamp, block){

    const marketsupply = async (contract) => {
        return await sdk.api.abi.multiCall(
            {
                abi: abi.totalSupply,
                calls: (contract.ids).map( id => ({
                    target:(contract.address),
                    params: [id]
                })),
                block
            }
        );
    }

    const allMarketSupplies = async () => {
        let allMarkets;
        for (let index = 0; index < contracts.length; index++) {
            if (!allMarkets) {
                allMarkets = await marketsupply(contracts[index]);
            } else {
                let temp = allMarkets.output;
                let response = await marketsupply(contracts[index]);
                response = response.output;
                allMarkets.output = temp.concat(response);
            } 
        }
        return allMarkets;
    }

    const supplies = await allMarketSupplies();

    return {
        [weth]: supplies.output.reduce((t,v) => t.plus(v.output), BigNumber(0)).toFixed(0)
    }
}

module.exports = {
    tvl,
    methodology: "Counts balance of receipt tokens in F1155 Contract on all vaults."
}