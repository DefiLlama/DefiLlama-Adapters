const { singleAssetV1Market,uniswapV1Market } = require('../aave/v1');

// v1
const aaveLendingPoolCore = "0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3";
const uniswapLendingPoolCore = "0x1012cfF81A1582ddD0616517eFB97D02c5c17E25";

function ethereum(borrowed) {
  return async (timestamp, block)=> {
    const balances = {}

    await singleAssetV1Market(balances, aaveLendingPoolCore, block, borrowed)
    await uniswapV1Market(balances, uniswapLendingPoolCore, block, borrowed)
    return balances
  }
}

module.exports = {
    ethereum: {
      tvl: ethereum(false),
      borrowed: ethereum(true),
    },
};