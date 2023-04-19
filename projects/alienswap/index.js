const sdk = require('@defillama/sdk')


const feeAddress = "0x0b22c0359b550da6cf3766d8c0d7ffc00e28a136"
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

async function tvl(_, _1, _2, { api }) {
    const balances = {};
  
    const collateralBalance = await api.call({
      abi: 'erc20:balanceOf',
      target: wethAddress,
      params: [feeAddress],
    });
  
    sdk.util.sumSingleBalance(balances, wethAddress, collateralBalance, api.chain)
  
    return balances;
  }

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'TVL counts WETH tokens in the Alienswap fee address:0x0b22c0359b550da6cf3766d8c0d7ffc00e28a136',
    
    ethereum: {
        tvl: tvl
    }
}
