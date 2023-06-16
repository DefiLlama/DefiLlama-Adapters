const ADDRESSES = require('../helper/coreAssets.json');
const abi = require('./abi.json');
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const {polygonContracts} = require('./polygon');
const {arbitrumContracts} = require('./arbitrum');
const {optimismContracts} = require('./optimism');
const {gnosisContracts} = requre('./gnosis');


const marketSupply = async (contracts, block, chain) => {
    const supply = await sdk.api.abi.multiCall(
        {
            abi: abi.totalAssets,
            calls: (contracts).map( vault => ({
                target: vault,
                params: []
            })),
            block,
            chain
        }
    );
    return supply.output.reduce((t,v) => t.plus(v.output), BigNumber(0)).toFixed(0);
}

async function polygon(_timestamp, ethBlock, chainBlocks){
    const wethSupplies = await marketSupply(polygonContracts.weth, chainBlocks.polygon, "polygon");

    return {
        [ADDRESSES.polygon.WETH_1]: wethSupplies,
        [ADDRESSES.polygon.MATICX]: usdcSupplies,
    }
}

// async function arbitrum(_timestamp, ethBlock, chainBlocks){
//     const wethSupplies = await allMarketSupplies(arbitrumContracts.weth, chainBlocks.arbirtum, "arbitrum");
//     const usdcSupplies = await allMarketSupplies(arbitrumContracts.usdc, chainBlocks.arbirtum, "arbitrum");

//     return {
//         [weth]: wethSupplies,
//         [usdc]: usdcSupplies,
//     }
// }

// async function optimism(_timestamp, ethBlock, chainBlocks){
//     const wethSupplies = await allMarketSupplies(optimismContracts.weth, chainBlocks.optimism, "optimism");
//     const usdcSupplies = await allMarketSupplies(optimismContracts.usdc, chainBlocks.optimism, "optimism");
//     return {
//         [weth]: wethSupplies,
//         [usdc]: usdcSupplies,
//     }
// }

module.exports = {
    timetravel: false,
    misrepresentedTokens: false,
    methodology: "Counts on-chain balance of assets deposits in all vaults.",
    polygon: {
        tvl: polygon
    }
}