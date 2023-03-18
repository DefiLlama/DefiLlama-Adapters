const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/unwrapLPs')

const v2Address = '0xc7ec02AEeCdC9087bf848c4C4f790Ed74A93F2AF';
const v202Address = '0xAdBAeE9665C101413EbFF07e20520bdB67C71AB6';
const v3Address = '0x4006A8840F8640A7D8F46D2c3155a58c76eCD56e';
const v320Address = '0x68a154fB3e8ff6e4DA10ECd54DEF25D9149DDBDE';

const WETH_CONTRACT = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const USDC_CONTRACT = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";

const abiGetTokenState = 'function getTokenState() returns (tuple(uint256 totalCompoundDeposited, uint256 totalCompoundBorrowed, uint256 totalNormalDeposited, uint256 totalNormalBorrowed, uint256 assetScaler, uint256 debtScaler, uint256 assetGrowth, uint256 debtGrowth), tuple(uint256 totalCompoundDeposited, uint256 totalCompoundBorrowed, uint256 totalNormalDeposited, uint256 totalNormalBorrowed, uint256 assetScaler, uint256 debtScaler, uint256 assetGrowth, uint256 debtGrowth))'

async function borrowed(_time, _ethBlock, chainBlocks, { api }) {
    let balances = {};

    const tokenState = await api.call({ abi: abiGetTokenState, target: v3Address, })

    await sdk.util.sumSingleBalance(balances, WETH_CONTRACT, tokenState[0]['totalNormalBorrowed'], api.chain);
    await sdk.util.sumSingleBalance(balances, USDC_CONTRACT, tokenState[1]['totalNormalBorrowed'], api.chain);

    return balances;
}


module.exports = {
    methodology: "USDC and WETH locked on predy contracts",
    arbitrum: {
        tvl: sumTokensExport({ owners: [v202Address, v2Address, v3Address, v320Address], tokens: [USDC_CONTRACT, WETH_CONTRACT,] }),
        borrowed
    },
    hallmarks: [
        [1671092333, "Launch Predy V3"]
        [1678734774, "Launch Predy V3.2"]
    ],
};
