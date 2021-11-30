const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json");
const totalTokenStakedAbi = require("./totalTokenStaked.abi.json");

// staking
const TOKEN_STAKING_ADDRESS = "0x4A2B73ebAc93D9233BAB10a795F04efb9C00D466";
const SET_ADDRESS = "avax:0x37d87e316CB4e35163881fDb6c6Bc0CdBa91dc0A";

// farm
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const FARM_ADDRESS_SUSD_USDC = "0xdB9E11363eCBAc008b42C59b80Bc25B1f1C66Cb2"
const LP_ADDRESS_SUSD_USDC = "0x360C233A63314B2b75cf0172E63B489BCeA8e4b4"
const AVAX_USDC_ADDRESS = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"

const FARM_ADDRESS_SET_USDC = "0xAA31D7Bc8186888D9Eebb5524C47268E4bC87496"
const LP_ADDRESS_SET_USDC = "0x31fa3838788A07607D95C9c640D041eAec649f50"

// system coll
const AVAX_ADDRESS = 'avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';
const AVAX_TROVE_MANAGER_ADDRESS = "0x7551A127C41C85E1412EfE263Cadb49900b0668C";

const ETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const ETH_TROVE_MANAGER_ADDRESS = "0x7837C2dB2d004eB10E608d95B2Efe8cb57fd40b4";

const BTC_ADDRESS = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
const BTC_TROVE_MANAGER_ADDRESS = "0x56c194F1fB30F8cdd49E7351fC9C67d8C762a86F";

const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const DAI_TROVE_MANAGER_ADDRESS = "0x54b35c002468a5Cc2BD1428C011857d26463ecbC";

// stability pool
const SUSD_ADDRESS = "avax:0xAafd2577Fb67366d3C89DB0d627C49D769ee2e5D";

const U_AVAX_ADDRESS = '0xc53A6EDa2C847ce9f10b5C8D51BC2a9Ed2Fe3d44';
const AVAX_STABILITY_POOL_ADDRESS = "0x4EBb1d6043e267EF5f2b88Ee18D414F541fD1b5C";

const U_ETH_ADDRESS = '0x6bD3156F45c063cfF86E7574Ad12f0bA8df589f7';
const ETH_STABILITY_POOL_ADDRESS = "0xBDe5cff40479853419c121E57B9FcF637338bd0c";

const U_BTC_ADDRESS = '0x979aB023e9F63f86eA08625BdAc258058a28D609';
const BTC_STABILITY_POOL_ADDRESS = "0x35d7d7Aeb582523285C56082e0A282678540f356";

const U_DAI_ADDRESS = '0x9fee03160502782CeB5845e8799638AF351D1Ed5';
const DAI_STABILITY_POOL_ADDRESS = "0x7Dd93401Df9BDe8a61d43ee99511CA658685f0BD";


// --- staking ---
async function stakingTvl(_, _ethBlock, chainBlocks) {
  const StakesBalance = (
    await sdk.api.abi.call({
      target: TOKEN_STAKING_ADDRESS,
      abi: totalTokenStakedAbi,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  return { 
    [SET_ADDRESS] : StakesBalance}

}


async function tvl(_, _ethBlock, chainBlocks) {
  
 


  // --- farm ---
  const FarmPoolLPBalance_SUSD_USDC = (
    await sdk.api.erc20.balanceOf({
      target: LP_ADDRESS_SUSD_USDC,
      owner: FARM_ADDRESS_SUSD_USDC,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const LPTotalSupply_SUSD_USDC = (
    await sdk.api.erc20.totalSupply({
      target: LP_ADDRESS_SUSD_USDC,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const LPValue_SUSD_USDC = (
    await sdk.api.erc20.balanceOf({
      target: AVAX_USDC_ADDRESS,
      owner: LP_ADDRESS_SUSD_USDC,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const FarmPoolBalance_SUSD_USDC = BigNumber(LPValue_SUSD_USDC).times(2).times(FarmPoolLPBalance_SUSD_USDC).div(LPTotalSupply_SUSD_USDC);
  
  const FarmPoolLPBalance_SET_USDC = (
    await sdk.api.erc20.balanceOf({
      target: LP_ADDRESS_SET_USDC,
      owner: FARM_ADDRESS_SET_USDC,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const LPTotalSupply_SET_USDC = (
    await sdk.api.erc20.totalSupply({
      target: LP_ADDRESS_SET_USDC,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const LPValue_SET_USDC = (
    await sdk.api.erc20.balanceOf({
      target: AVAX_USDC_ADDRESS,
      owner: LP_ADDRESS_SET_USDC,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const FarmPoolBalance_SET_USDC = BigNumber(LPValue_SET_USDC).times(2).times(FarmPoolLPBalance_SET_USDC).div(LPTotalSupply_SET_USDC);

  const FarmPoolBalance = FarmPoolBalance_SUSD_USDC.plus(FarmPoolBalance_SET_USDC);


  // --- System Coll ---

  const AVAXBalance = (
    await sdk.api.abi.call({
      target: AVAX_TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const ETHBalance = (
    await sdk.api.abi.call({
      target: ETH_TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const BTCBalance = (
    await sdk.api.abi.call({
      target: BTC_TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const DAIBalance = (
    await sdk.api.abi.call({
      target: DAI_TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;


  // --- Stability pool ---

  const StabilityPoolBalanceOfAVAX = (
    await sdk.api.erc20.balanceOf({
      target: U_AVAX_ADDRESS,
      owner: AVAX_STABILITY_POOL_ADDRESS,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const StabilityPoolBalanceOfETH = (
    await sdk.api.erc20.balanceOf({
      target: U_ETH_ADDRESS,
      owner: ETH_STABILITY_POOL_ADDRESS,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const StabilityPoolBalanceOfBTC = (
    await sdk.api.erc20.balanceOf({
      target: U_BTC_ADDRESS,
      owner: BTC_STABILITY_POOL_ADDRESS,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const StabilityPoolBalanceOfDAI = (
    await sdk.api.erc20.balanceOf({
      target: U_DAI_ADDRESS,
      owner: DAI_STABILITY_POOL_ADDRESS,
      block: chainBlocks['avax'],
      chain: 'avax'
    })
  ).output;

  const StabilityPoolTotalBalance = 
    BigNumber(StabilityPoolBalanceOfAVAX)
    .plus(StabilityPoolBalanceOfETH)
    .plus(StabilityPoolBalanceOfBTC)
    .plus(StabilityPoolBalanceOfDAI).toFixed();

  return { 
    
    [USDC_ADDRESS]: FarmPoolBalance,
    [SUSD_ADDRESS]: StabilityPoolTotalBalance,
    [AVAX_ADDRESS]: AVAXBalance, 
    [ETH_ADDRESS] : ETHBalance, 
    [BTC_ADDRESS] : BTCBalance, 
    [DAI_ADDRESS] : DAIBalance};
}

module.exports = {
  avalanche:{
    tvl: tvl,
    staking: stakingTvl
  }
  
};
