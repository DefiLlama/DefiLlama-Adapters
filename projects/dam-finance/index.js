const sdk = require('@defillama/sdk');
const ethCollateralJoins = ["0xB1fbcD7415F9177F5EBD3d9700eD5F15B476a5Fe"]


async function tvl(timestamp, ethBlock, otherBlocks, { api }){

    const balances = {};

    const collateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        params: ethCollateralJoins[0],
    });

    sdk.util.sumSingleBalance(balances, "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", collateralBalance, api.chain)
  
    return balances;
}

module.exports = {
    methodology: 'Currently counting the USDC that DAM Finance has locked up, but will add more collateral types and multiple chains in the future',
    start: 16375673, // LMCV Deployment Block
    ethereum: {
        tvl
      }
  }; 