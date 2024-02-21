const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const getAllCollateralAbi = 'function getAllCollateral() view returns (address[], uint256[])'
const fetchPrice_vAbi = "uint256:fetchPrice_v"
const farmPoolTotalSupplyAbi = "uint256:totalSupply"
const curve_get_virtual_priceAbi = "uint256:get_virtual_price"
const getPriceAbi = 'function getPrice(address _collateral) view returns (uint256)'
const getReservesAbi = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'

// YetiController knows the price of the collateral
const YETI_CONTROLLER_ADDRESS = "0xcCCCcCccCCCc053fD8D1fF275Da4183c2954dBe3";

// All system collaterals are stored across activepool and defaultpool
const ACTIVE_POOL_ADDRESS = "0xAAAaaAaaAaDd4AA719f0CF8889298D13dC819A15";
const DEFAULT_POOL_ADDRESS = "0xdDDDDDdDDD3AD7297B3D13E17414fBED370cd425";

const FARM_ADDRESS = "0xfffFffFFfFe8aA117FE603a37188E666aF110F39";
const BOOST_CURVE_LP_FARM_ADDRESS = "0xD8A4AA01D54C8Fdd104EAC28B9C975f0663E75D8"

const YUSDCURVE_POOL_ADDRESS = "0x1da20ac34187b2d9c74f729b85acb225d3341b25"

const YETIAVAX_POOL2_ADDRESS = "0xbdc7EF37283BC67D50886c4afb64877E3e83f869"

const YETI_PRICEFEED = "0x8a98709077E8A98ECAf89056838a99b484686863"

const AVAX_PRICEFEED = "0x45F7260f7Cc47b15eB5cB6ac0dAaBd8Efb2A0edB"

const YETI_TOKEN_ADDRESS = "0x77777777777d4554c39223C354A05825b2E8Faa3"

const VEYETI_ADDRESS = "0x88888888847DF39Cf1dfe1a05c904b4E603C9416"
const chain = 'avax'
/**
 * Get TVL of YETI FInance
 */
async function tvl(_, _block, chainBlocks) {
  const block = chainBlocks[chain]
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

  const curveBoostFarmAmount = (
    await sdk.api.abi.call({
      target: BOOST_CURVE_LP_FARM_ADDRESS,
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

  const farmTvl = (+curveFarmAmount + +curveBoostFarmAmount) * +YUSDCurvPrice / (10 ** 18)

  const total =  systemCollateralTvl + farmTvl

  return {
    // In USDC, USDC has decimal of 6
    ["avax:" + ADDRESSES.avax.USDC]: total / (10 ** 12)
  }
}

async function pool2(_, _block, chainBlocks) {
  const block = chainBlocks[chain]
  const reserves = (
    await sdk.api.abi.call({
      target: YETIAVAX_POOL2_ADDRESS,
      abi: getReservesAbi,
      block,
      chain: "avax"
    })
  ).output
  const YETIReserve = reserves[0]
  const AVAXReserve = reserves[1]

  const YETIPrice = (
    await sdk.api.abi.call({
      target: YETI_PRICEFEED,
      abi: fetchPrice_vAbi,
      block,
      chain: "avax"
    })
  ).output

  const AVAXPrice = (
    await sdk.api.abi.call({
      target: AVAX_PRICEFEED,
      abi: fetchPrice_vAbi,
      block,
      chain: "avax"
    })
  ).output

  const pool2ValueUSD = (YETIReserve * YETIPrice + AVAXReserve * AVAXPrice) / 10 ** 18
  return {
    // In USDC, USDC has decimal of 6
    ["avax:" + ADDRESSES.avax.USDC]: pool2ValueUSD / (10 ** 12)
  }
}

async function staking(_, _block, chainBlocks) {
  const block = chainBlocks[chain]
  const veYETIBalance = (
    await sdk.api.erc20.balanceOf({
      target: YETI_TOKEN_ADDRESS,
      owner: VEYETI_ADDRESS,
      block,
      chain:"avax"
    })
  ).output;

  const YETIPrice = (
    await sdk.api.abi.call({
      target: YETI_PRICEFEED,
      abi: fetchPrice_vAbi,
      block,
      chain: "avax"
    })
  ).output

  const stakingUSD = veYETIBalance * YETIPrice / (10 ** 18)
  return {
    // In USDC, USDC has decimal of 6
    ["avax:" + ADDRESSES.avax.USDC]: stakingUSD / (10 ** 12)
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: true,
  // first trove opened
  start: 1650027587,
  avax:{
    tvl,
    pool2,
    staking
  },
};
