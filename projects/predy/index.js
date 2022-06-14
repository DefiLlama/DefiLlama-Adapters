const sdk = require('@defillama/sdk');

const predyContract = '0xc7ec02AEeCdC9087bf848c4C4f790Ed74A93F2AF'

const weth = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const usdc = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";

async function tvl(_time, _ethBlock, chainBlocks) {
    let balances = {};

    balances[`arbitrum:${usdc}`] = (await sdk.api.erc20.balanceOf({
        target: usdc,
        owner: predyContract,
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    })).output;

    balances[`arbitrum:${weth}`] = (await sdk.api.erc20.balanceOf({
        target: weth,
        owner: predyContract,
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    })).output;

    return balances;
};

module.exports = {
    methodology: "USDC and WETH locked on predy contracts",
    arbitrum: {
        tvl
    }
};
