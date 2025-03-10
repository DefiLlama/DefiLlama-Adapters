const { singleAssetV1Market,uniswapV1Market } = require('../aave/v1');

// v1
const aaveLendingPoolCore = "0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3";
const uniswapLendingPoolCore = "0x1012cfF81A1582ddD0616517eFB97D02c5c17E25";

function ethereum(borrowed) {
  return async (timestamp, block)=> {
    const balances = {}

    // The singleAssetV1Market function calculates the TVL for single asset markets in Aave V1.
    await singleAssetV1Market(balances, aaveLendingPoolCore, block, borrowed)
    // The uniswapV1Market function calculates the TVL for Uniswap V1 markets in Aave V1.
    await uniswapV1Market(balances, uniswapLendingPoolCore, block, borrowed)
    return balances
  }
}

module.exports = {
    ethereum: {
      tvl: ethereum(false),
      borrowed: ethereum(true),
    },
    // The methodology property explains how the TVL is calculated.
    methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending."
};
