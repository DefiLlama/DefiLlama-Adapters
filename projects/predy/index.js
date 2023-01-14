const sdk = require('@defillama/sdk');

const v2Address = '0xc7ec02AEeCdC9087bf848c4C4f790Ed74A93F2AF';
const v202Address = '0xAdBAeE9665C101413EbFF07e20520bdB67C71AB6';
const v3Address = '0x4006A8840F8640A7D8F46D2c3155a58c76eCD56e';

const WETH_CONTRACT = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const USDC_CONTRACT = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";

const abiGetTokenState = {"inputs":[],"name":"getTokenState","outputs":[{"components":[{"internalType":"uint256","name":"totalCompoundDeposited","type":"uint256"},{"internalType":"uint256","name":"totalCompoundBorrowed","type":"uint256"},{"internalType":"uint256","name":"totalNormalDeposited","type":"uint256"},{"internalType":"uint256","name":"totalNormalBorrowed","type":"uint256"},{"internalType":"uint256","name":"assetScaler","type":"uint256"},{"internalType":"uint256","name":"debtScaler","type":"uint256"},{"internalType":"uint256","name":"assetGrowth","type":"uint256"},{"internalType":"uint256","name":"debtGrowth","type":"uint256"}],"internalType":"struct BaseToken.TokenState","name":"","type":"tuple"},{"components":[{"internalType":"uint256","name":"totalCompoundDeposited","type":"uint256"},{"internalType":"uint256","name":"totalCompoundBorrowed","type":"uint256"},{"internalType":"uint256","name":"totalNormalDeposited","type":"uint256"},{"internalType":"uint256","name":"totalNormalBorrowed","type":"uint256"},{"internalType":"uint256","name":"assetScaler","type":"uint256"},{"internalType":"uint256","name":"debtScaler","type":"uint256"},{"internalType":"uint256","name":"assetGrowth","type":"uint256"},{"internalType":"uint256","name":"debtGrowth","type":"uint256"}],"internalType":"struct BaseToken.TokenState","name":"","type":"tuple"}],"stateMutability":"nonpayable","type":"function"}

async function tvlByContractAddress(balances, chainBlocks, api, owner) {

    const usdc = await api.call({
        abi: 'erc20:balanceOf',
        target: USDC_CONTRACT,
        params: [owner],
      });

    await sdk.util.sumSingleBalance(balances, USDC_CONTRACT, usdc, api.chain);

    const weth = await api.call({
        abi: 'erc20:balanceOf',
        target: WETH_CONTRACT,
        params: [owner],
      });

    await sdk.util.sumSingleBalance(balances, WETH_CONTRACT, weth, api.chain);

    return balances;
}

async function borrowed(_time, _ethBlock, chainBlocks, { api }) {
    let balances = {};

    const tokenState = await api.call({
        abi: abiGetTokenState,
        target: v3Address,
    });
    
    await sdk.util.sumSingleBalance(balances, WETH_CONTRACT, tokenState[0]['totalNormalBorrowed'], api.chain);
    await sdk.util.sumSingleBalance(balances, USDC_CONTRACT, tokenState[1]['totalNormalBorrowed'], api.chain);

    return balances;
}

async function tvl(_time, _ethBlock, chainBlocks, { api }) {
    let balances = {};

    balances = await tvlByContractAddress(balances, chainBlocks, api, v2Address);
    balances = await tvlByContractAddress(balances, chainBlocks, api, v202Address);
    balances = await tvlByContractAddress(balances, chainBlocks, api, v3Address);

    return balances;
};

module.exports = {
    methodology: "USDC and WETH locked on predy contracts",
    arbitrum: {
        tvl,
        borrowed
    },
    hallmarks:[
        [1671092333, "Launch Predy V3"]
    ],
};
