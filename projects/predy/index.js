const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");

const predyContractV2 = '0xc7ec02AEeCdC9087bf848c4C4f790Ed74A93F2AF';
const predyContractV202 = '0xAdBAeE9665C101413EbFF07e20520bdB67C71AB6';

const weth = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const usdc = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";

async function tvl(_time, _ethBlock, chainBlocks) {
    let balances = {};

    const v2usdc = (await sdk.api.erc20.balanceOf({
        target: usdc,
        owner: predyContractV2,
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    })).output;

    const v202usdc = (await sdk.api.erc20.balanceOf({
        target: usdc,
        owner: predyContractV202,
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    })).output;

    balances[`arbitrum:${usdc}`] = BigNumber(v2usdc).plus(v202usdc);

    const v2weth = (await sdk.api.erc20.balanceOf({
        target: weth,
        owner: predyContractV2,
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    })).output;

    const v202weth = (await sdk.api.erc20.balanceOf({
        target: weth,
        owner: predyContractV202,
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    })).output;

    balances[`arbitrum:${weth}`] = BigNumber(v2weth).plus(v202weth);
    return balances;
};

module.exports = {
    methodology: "USDC and WETH locked on predy contracts",
    arbitrum: {
        tvl
    }
};
