const sdk = require("@defillama/sdk");

const getAllCollateralAbi = require("./getAllCollateral.abi.json");
const fetchPrice_vAbi = require("./fetchPrice_v.abi.json")
const farmPoolTotalSupplyAbi = require("./farmPoolTotalSupply.abi.json")
const curve_get_virtual_priceAbi = require("./curve_get_virtual_price.abi.json")
const getPriceAbi = require("./getPrice.abi.json");
const { token } = require("@project-serum/anchor/dist/cjs/utils");

const YUSD_TOKEN_ADDRESS = "0x111111111111ed1D73f860F57b2798b683f2d325";
const YUSD_PRICEFEED_ADDRESS = "0x38C67a46304b9ad4A0A210A65a640213505bd1Dc";
// StabilityPool holds deposited YUSD
const STABILITY_POOL_ADDRESS = "0xFFffFfffFff5d3627294FeC5081CE5C5D7fA6451";

// YetiController knows the price of the collateral
const YETI_CONTROLLER_ADDRESS = "0xcCCCcCccCCCc053fD8D1fF275Da4183c2954dBe3";

// All system collaterals are stored across activepool and defaultpool
const ACTIVE_POOL_ADDRESS = "0xAAAaaAaaAaDd4AA719f0CF8889298D13dC819A15";
const DEFAULT_POOL_ADDRESS = "0xdDDDDDdDDD3AD7297B3D13E17414fBED370cd425";

const FARM_ADDRESS = "0xfffFffFFfFe8aA117FE603a37188E666aF110F39";

const YUSDCURVE_POOL_ADDRESS = "0x1da20ac34187b2d9c74f729b85acb225d3341b25"

async function tvl(_, block) {
  // const YUSDInStabilityPool = (
  //   await sdk.api.erc20.balanceOf({
  //     target: YUSD_TOKEN_ADDRESS,
  //     owner: STABILITY_POOL_ADDRESS,
  //     block,
  //     chain:"avax"
  //   })
  // ).output;

  // const YUSDPrice = (
  //   await sdk.api.abi.call({
  //     target: YUSD_PRICEFEED_ADDRESS,
  //     abi: fetchPrice_vAbi,
  //     block,
  //     chain: "avax"
  //   })
  // ).output
  
  // const stabilityPoolYUSDTvl = +YUSDInStabilityPool * +YUSDPrice / (10 ** 18)

  const activePoolCollaterals = (
    await sdk.api.abi.call({
      target: ACTIVE_POOL_ADDRESS,
      abi: getAllCollateralAbi,
      block,
      chain: "avax"
    })
  ).output

  const defaultPoolCollaterals = (
    await sdk.api.abi.call({
      target: DEFAULT_POOL_ADDRESS,
      abi: getAllCollateralAbi,
      block,
      chain: "avax"
    })
  ).output

  // require(activePoolCollaterals[0].length === defaultPoolCollaterals[0].length, "active pool collaterals and default pool collaterals have different length")
  
  // in USD
  let systemCollateralTvl = 0
  // iterate through all the collateral types and sum up amount * price to get TVL in USD
  for (let i = 0; i < activePoolCollaterals[0].length; i++) {
    
    const tokenAddress = activePoolCollaterals[0][i]
    const amount = +activePoolCollaterals[1][i] + +defaultPoolCollaterals[1][i]
    const decimals = (
      await sdk.api.erc20.decimals(tokenAddress, "avax")
    ).output;
      
    const price = (
      await sdk.api.abi.call({
        target: YETI_CONTROLLER_ADDRESS,
        abi: getPriceAbi,
        block,
        chain: "avax",
        params: tokenAddress
      })
    ).output
    

    // some collaterals have decimals that is < 18 so need to normalize decimals
    systemCollateralTvl += amount * (10 ** (18 - +decimals)) * +price / (10 ** 18)
  }


  const curveFarmAmount = (
    await sdk.api.abi.call({
      target: FARM_ADDRESS,
      abi: farmPoolTotalSupplyAbi,
      block,
      chain: "avax"
    })
  ).output

  const YUSDCurvPrice = (
    await sdk.api.abi.call({
      target: YUSDCURVE_POOL_ADDRESS,
      abi: curve_get_virtual_priceAbi,
      block,
      chain: "avax"
    })
  ).output

  const farmTvl = +curveFarmAmount * +YUSDCurvPrice / (10 ** 18)

  const total =  systemCollateralTvl + farmTvl

  return {
    // In USDC, USDC has decimal of 6
    ["avax:0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"]: total / (10 ** 12)
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Total System Collateral Deposits + YUSDCurve LP Token Farm Staking",
  // first trove opened
  start: 1650027587,
  avalanche:{
    tvl,
  },
};
