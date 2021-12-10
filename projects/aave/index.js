const sdk = require('@defillama/sdk');
const { getV2Reserves, getV2Tvl, aaveExports, getV2Borrowed } = require('../helper/aave');
const { staking } = require('../helper/staking');
const { singleAssetV1Market,uniswapV1Market } = require('./v1');
const { ammMarket } = require('./amm');


const addressesProviderRegistryETH = "0x52D306e36E3B6B02c153d0266ff0f85d18BCD413";

// v1
const aaveLendingPoolCore = "0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3";
const uniswapLendingPoolCore = "0x1012cfF81A1582ddD0616517eFB97D02c5c17E25";

function ethereum(borrowed) {
  return async (timestamp, block)=> {
    const balances = {}

    await singleAssetV1Market(balances, aaveLendingPoolCore, block, borrowed)
    await uniswapV1Market(balances, uniswapLendingPoolCore, block, borrowed)

    // V2 TVLs
    if (block >= 11360925) {
      const [v2Atokens, v2ReserveTokens, dataHelper] = await getV2Reserves(block, addressesProviderRegistryETH, 'ethereum')
      if(borrowed){
        await getV2Borrowed(balances, block, "ethereum", v2ReserveTokens, dataHelper, id=>id);
      } else {
        await getV2Tvl(balances, block, 'ethereum', v2Atokens, v2ReserveTokens, id => id);
      }
    }
    if (block >= 11998773) {
      await ammMarket(balances, block, borrowed)
    }

    return balances;
  }
}

const aaveBalancerContractImp = "0xC697051d1C6296C24aE3bceF39acA743861D9A81";
const aaveTokenAddress = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";
const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

async function stakingBalancerTvl(timestamp, block) {
  const aaveBal = (
    await sdk.api.abi.call({
      target: aaveTokenAddress,
      params: aaveBalancerContractImp,
      abi: "erc20:balanceOf",
      block,
    })
  ).output;

  const wethBal = (
    await sdk.api.abi.call({
      target: wethTokenAddress,
      params: aaveBalancerContractImp,
      abi: "erc20:balanceOf",
      block,
    })
  ).output;

  return {
    [aaveTokenAddress]: aaveBal,
    [wethTokenAddress]: wethBal,
  };
}

const aaveStakingContract = "0x4da27a545c0c5b758a6ba100e3a049001de870f5";

module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  ethereum: {
    staking: staking(aaveStakingContract, aaveTokenAddress),
    pool2: stakingBalancerTvl,
    tvl: ethereum(false),
    borrowed: ethereum(true),
  },
  avalanche: aaveExports("avax", "0x4235E22d9C3f28DCDA82b58276cb6370B01265C2"),
  polygon: aaveExports("polygon", "0x3ac4e9aa29940770aeC38fe853a4bbabb2dA9C19"),
};
