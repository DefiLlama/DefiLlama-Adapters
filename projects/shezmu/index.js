const sdk = require("@defillama/sdk")
const { default: BigNumber } = require("bignumber.js")

const { sumTokens2 } = require('../helper/unwrapLPs')
const abi = require('./abi.json')

// tokens
const GUARDIAN = "0x1d1B79A8C50Df0e11019f822cd3d7E5d485eBdAa"
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const wstETH = "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0"
const weETH = "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee"
const sUSDe = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497"
const sfrxETH = "0xac3e018457b222d93114458476f3e3416abbe38f"
const ptUniETH = "0x15fA86404BFbA8b46684552F792558128bFB6418"
const wOETH = "0xdcee70654261af21c44c093c300ed3bb97b78192"
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52"
const SHEZ = "0x5fE72ed557d8a02FFf49B3B826792c765d5cE162"
const SHEZ_ETH_LP = "0x74E6cAc32234133Fe06bD0f4D8237dEe1dedE057"

const PHRAOH_VALUE_PROVIDER = "0x7717fFc018848e45d117221e84983C1B2B3F55A4";

// erc1155 vaults
const PHRAOH_VAULT = "0xCf34E165C5224c1351c915ea061aDdA479c74B88";

// erc20 vaults
const USDC_SHEZUSD_VAULT = "0xF89127a7839Ae1918e742A99E39182adec9C7e48";
const wstETH_SHEZUSD_VAULT = "0xd116641185B1BD999b92B513657C95f78C8ae872";
const wstETH_SHEZETH_VAULT = "0x092dBbFCb19D1763798CD46bA1635Eaf3C9BA1cD";
const weETH_SHEZUSD_VAULT = "0x5439046DC57EdE3Ff6aBA8563108326AdDE9C33b";
const weETH_SHEZETH_VAULT = "0x7648cff49EBa2631Ea4Ae8013Dc6Eb54C1c783f2";
const sUSDe_SHEZETH_VAULT = "0x4DBBDF30BC801a65f6978ab629EAd5267Ac02497";
const sfrxETH_SHEZETH_VAULT = "0x8A8355317936Ef99E4515567b1c9CC8B86e52a3b";
const ptUniETH_SHEZETH_VAULT = "0x84D45BF4a70605fc84D618e1809E90f73dA8f369";
const wOETH_SHEZUSD_VAULT = "0xF00A9f21a72FabCfBAeEfa70D08D947f61B2D16C";
const wOETH_SHEZETH_VAULT = "0x95D970fa98bf608862aE76b5492E53E701210E9F";
const WETH_SHEZUSD_VAULT = "0x6625364D0499EcEB5C9308c90eb660B96dFd0746";
const WETH_SHEZETH_VAULT = "0x6261a4a8776343192f3bdeC04F7909591c375cfb";
const WBTC_SHEZUSD_VAULT = "0x3d0D2bDd6f0118ad6194aab84f10Fde688502d16";
const CRV_SHEZUSD_VAULT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

// SHEZ single staking v1
const SHEZ_SINGLE_STAKING_V1 = "0xB775f1c426849Ba75891258abA496F69D2e6F570";

// SHEZ-ETH LP pool
const SHEZ_ETH_LP_POOL = "0x4574220A54b0306c2CBEc22A3B6C69158b27f1da";

// get Oasis TVL of Pharaoh vault
async function getOasisTvlPharaohVault(timestamp, block) {
  const balances = {};

  const { output: erc1155Balances } = await sdk.api.abi.multiCall({ abi: abi.balanceOf, calls: [{ target: GUARDIAN, params: [PHRAOH_VAULT, 5] }], block, })
  const { output: erc1155Prices } = await sdk.api.abi.multiCall({ abi: abi.getFloorUSD, calls: [{ target: PHRAOH_VALUE_PROVIDER, params: [] }], block, })

  // solution1: based on Shezmu price
  // erc1155Balances.forEach(({ output, }, i) => {
  //   sdk.util.sumSingleBalance(balances, SHEZ, BigNumber(output).times(1000).times(1e18).toString())
  // })

  // solution2: based on USDC price
  erc1155Balances.forEach(({ output, }, i) => {
    sdk.util.sumSingleBalance(balances, USDC, BigNumber(output).times(1e6).times(erc1155Prices[i].output).div(1e18).toNumber())
  })

  return balances
}

// get Oasis TVL of ERC20 vaults
async function getOasisTvlERC20Vaults(api) {
  const tokensAndOwners = [
    [USDC, USDC_SHEZUSD_VAULT],
    [wstETH, wstETH_SHEZUSD_VAULT],
    [wstETH, wstETH_SHEZETH_VAULT],
    [weETH, weETH_SHEZUSD_VAULT],
    [weETH, weETH_SHEZETH_VAULT],
    [sUSDe, sUSDe_SHEZETH_VAULT],
    [sfrxETH, sfrxETH_SHEZETH_VAULT],
    [ptUniETH, ptUniETH_SHEZETH_VAULT],
    [wOETH, wOETH_SHEZUSD_VAULT],
    [wOETH, wOETH_SHEZETH_VAULT],
    [WETH, WETH_SHEZUSD_VAULT],
    [WETH, WETH_SHEZETH_VAULT],
    [WBTC, WBTC_SHEZUSD_VAULT],
    [CRV, CRV_SHEZUSD_VAULT]
  ]
  return sumTokens2({ api, tokensAndOwners })
}


// get Agora TVL of single staking v1
async function getAgoraTvlSingleStakingV1(api) {
  const tokensAndOwners = [
    [SHEZ, SHEZ_SINGLE_STAKING_V1]
  ]
  return sumTokens2({ api, tokensAndOwners })
}

// get Agora TVL of shezmu-eth lp pool
async function getAgoraTvlShezmuEthLpPool(api) {
  const tokensAndOwners = [
    [SHEZ_ETH_LP, SHEZ_ETH_LP_POOL]
  ]
  return sumTokens2({ api, tokensAndOwners })
}

async function tvl(api) {
  const oasisTvlPharaohVault = await getOasisTvlPharaohVault();
  const oasisTvlERC20Vaults = await getOasisTvlERC20Vaults(api);

  const agoraTvlSingleStakingV1 = await getAgoraTvlSingleStakingV1(api);
  const agoraTvlShezmuEthLp = await getAgoraTvlShezmuEthLpPool(api);

  return { ...oasisTvlPharaohVault, ...oasisTvlERC20Vaults, ...agoraTvlSingleStakingV1, ...agoraTvlShezmuEthLp }
}

module.exports = {
  ethereum: {
    tvl
  },
}