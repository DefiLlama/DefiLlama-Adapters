
const sdk = require("@defillama/sdk");

const FINX = "0xb6943825E461C6d8f2DDF17307C0571972f169FB";
const GENESIS_POOL = "0x0711c9f411FFc4Fe331256E83ee8C910a997A16a";
const USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const depositTokenGenesis = [USDC, WETH]
const arbitrumTvl = async (timestamp, ethBlock, { arbitrum: block }) => {
    const balances = {}
    const stakedUSDC = (await sdk.api.abi.call({
        target: USDC, 
        params: GENESIS_POOL,
        abi: 'erc20:balanceOf',
        block:	block,
        chain: 'arbitrum'
    })).output
    const stakedWETH = (await sdk.api.abi.call({
        target: WETH, 
        params: GENESIS_POOL,
        abi: 'erc20:balanceOf',
        block: 	block,
        chain: 'arbitrum'
    })).output
    balances[`arbitrum:${USDC}`] = stakedUSDC
    balances[`arbitrum:${WETH}`] = stakedWETH
    return balances
}
module.exports = {
    methodology: "Calculator USDC and WETH staked to genesis pool contract",
    arbitrum: {
        tvl: arbitrumTvl
    },
}
