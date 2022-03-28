const web3 = require("../config/web3.js");

const BigNumber = require("bignumber.js");

const abis = require("../config/abis.js");
const curveAbi = JSON.parse(
  '[{"name":"Transfer","inputs":[{"type":"address","name":"sender","indexed":true},{"type":"address","name":"receiver","indexed":true},{"type":"uint256","name":"value","indexed":false}],"anonymous":false,"type":"event"},{"name":"Approval","inputs":[{"type":"address","name":"owner","indexed":true},{"type":"address","name":"spender","indexed":true},{"type":"uint256","name":"value","indexed":false}],"anonymous":false,"type":"event"},{"name":"TokenExchange","inputs":[{"type":"address","name":"buyer","indexed":true},{"type":"int128","name":"sold_id","indexed":false},{"type":"uint256","name":"tokens_sold","indexed":false},{"type":"int128","name":"bought_id","indexed":false},{"type":"uint256","name":"tokens_bought","indexed":false}],"anonymous":false,"type":"event"},{"name":"TokenExchangeUnderlying","inputs":[{"type":"address","name":"buyer","indexed":true},{"type":"int128","name":"sold_id","indexed":false},{"type":"uint256","name":"tokens_sold","indexed":false},{"type":"int128","name":"bought_id","indexed":false},{"type":"uint256","name":"tokens_bought","indexed":false}],"anonymous":false,"type":"event"},{"name":"AddLiquidity","inputs":[{"type":"address","name":"provider","indexed":true},{"type":"uint256[2]","name":"token_amounts","indexed":false},{"type":"uint256[2]","name":"fees","indexed":false},{"type":"uint256","name":"invariant","indexed":false},{"type":"uint256","name":"token_supply","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidity","inputs":[{"type":"address","name":"provider","indexed":true},{"type":"uint256[2]","name":"token_amounts","indexed":false},{"type":"uint256[2]","name":"fees","indexed":false},{"type":"uint256","name":"token_supply","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidityOne","inputs":[{"type":"address","name":"provider","indexed":true},{"type":"uint256","name":"token_amount","indexed":false},{"type":"uint256","name":"coin_amount","indexed":false},{"type":"uint256","name":"token_supply","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidityImbalance","inputs":[{"type":"address","name":"provider","indexed":true},{"type":"uint256[2]","name":"token_amounts","indexed":false},{"type":"uint256[2]","name":"fees","indexed":false},{"type":"uint256","name":"invariant","indexed":false},{"type":"uint256","name":"token_supply","indexed":false}],"anonymous":false,"type":"event"},{"name":"CommitNewAdmin","inputs":[{"type":"uint256","name":"deadline","indexed":true},{"type":"address","name":"admin","indexed":true}],"anonymous":false,"type":"event"},{"name":"NewAdmin","inputs":[{"type":"address","name":"admin","indexed":true}],"anonymous":false,"type":"event"},{"name":"CommitNewFee","inputs":[{"type":"uint256","name":"deadline","indexed":true},{"type":"uint256","name":"fee","indexed":false},{"type":"uint256","name":"admin_fee","indexed":false}],"anonymous":false,"type":"event"},{"name":"NewFee","inputs":[{"type":"uint256","name":"fee","indexed":false},{"type":"uint256","name":"admin_fee","indexed":false}],"anonymous":false,"type":"event"},{"name":"RampA","inputs":[{"type":"uint256","name":"old_A","indexed":false},{"type":"uint256","name":"new_A","indexed":false},{"type":"uint256","name":"initial_time","indexed":false},{"type":"uint256","name":"future_time","indexed":false}],"anonymous":false,"type":"event"},{"name":"StopRampA","inputs":[{"type":"uint256","name":"A","indexed":false},{"type":"uint256","name":"t","indexed":false}],"anonymous":false,"type":"event"},{"outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"name":"initialize","outputs":[],"inputs":[{"type":"string","name":"_name"},{"type":"string","name":"_symbol"},{"type":"address","name":"_coin"},{"type":"uint256","name":"_decimals"},{"type":"uint256","name":"_A"},{"type":"uint256","name":"_fee"},{"type":"address","name":"_admin"}],"stateMutability":"nonpayable","type":"function","gas":470049},{"name":"decimals","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":291},{"name":"transfer","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"stateMutability":"nonpayable","type":"function","gas":75402},{"name":"transferFrom","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"stateMutability":"nonpayable","type":"function","gas":112037},{"name":"approve","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"address","name":"_spender"},{"type":"uint256","name":"_value"}],"stateMutability":"nonpayable","type":"function","gas":37854},{"name":"get_previous_balances","outputs":[{"type":"uint256[2]","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2254},{"name":"get_balances","outputs":[{"type":"uint256[2]","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2284},{"name":"get_twap_balances","outputs":[{"type":"uint256[2]","name":""}],"inputs":[{"type":"uint256[2]","name":"_first_balances"},{"type":"uint256[2]","name":"_last_balances"},{"type":"uint256","name":"_time_elapsed"}],"stateMutability":"view","type":"function","gas":1522},{"name":"get_price_cumulative_last","outputs":[{"type":"uint256[2]","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2344},{"name":"admin_fee","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":621},{"name":"A","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":5859},{"name":"A_precise","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":5821},{"name":"get_virtual_price","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1011891},{"name":"calc_token_amount","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256[2]","name":"_amounts"},{"type":"bool","name":"_is_deposit"}],"stateMutability":"view","type":"function"},{"name":"calc_token_amount","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256[2]","name":"_amounts"},{"type":"bool","name":"_is_deposit"},{"type":"bool","name":"_previous"}],"stateMutability":"view","type":"function"},{"name":"add_liquidity","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256[2]","name":"_amounts"},{"type":"uint256","name":"_min_mint_amount"}],"stateMutability":"nonpayable","type":"function"},{"name":"add_liquidity","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256[2]","name":"_amounts"},{"type":"uint256","name":"_min_mint_amount"},{"type":"address","name":"_receiver"}],"stateMutability":"nonpayable","type":"function"},{"name":"get_dy","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dx"}],"stateMutability":"view","type":"function"},{"name":"get_dy","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dx"},{"type":"uint256[2]","name":"_balances"}],"stateMutability":"view","type":"function"},{"name":"get_dy_underlying","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dx"}],"stateMutability":"view","type":"function"},{"name":"get_dy_underlying","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dx"},{"type":"uint256[2]","name":"_balances"}],"stateMutability":"view","type":"function"},{"name":"exchange","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dx"},{"type":"uint256","name":"min_dy"}],"stateMutability":"nonpayable","type":"function"},{"name":"exchange","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dx"},{"type":"uint256","name":"min_dy"},{"type":"address","name":"_receiver"}],"stateMutability":"nonpayable","type":"function"},{"name":"exchange_underlying","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dx"},{"type":"uint256","name":"min_dy"}],"stateMutability":"nonpayable","type":"function"},{"name":"exchange_underlying","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dx"},{"type":"uint256","name":"min_dy"},{"type":"address","name":"_receiver"}],"stateMutability":"nonpayable","type":"function"},{"name":"remove_liquidity","outputs":[{"type":"uint256[2]","name":""}],"inputs":[{"type":"uint256","name":"_burn_amount"},{"type":"uint256[2]","name":"_min_amounts"}],"stateMutability":"nonpayable","type":"function"},{"name":"remove_liquidity","outputs":[{"type":"uint256[2]","name":""}],"inputs":[{"type":"uint256","name":"_burn_amount"},{"type":"uint256[2]","name":"_min_amounts"},{"type":"address","name":"_receiver"}],"stateMutability":"nonpayable","type":"function"},{"name":"remove_liquidity_imbalance","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256[2]","name":"_amounts"},{"type":"uint256","name":"_max_burn_amount"}],"stateMutability":"nonpayable","type":"function"},{"name":"remove_liquidity_imbalance","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256[2]","name":"_amounts"},{"type":"uint256","name":"_max_burn_amount"},{"type":"address","name":"_receiver"}],"stateMutability":"nonpayable","type":"function"},{"name":"calc_withdraw_one_coin","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"_burn_amount"},{"type":"int128","name":"i"}],"stateMutability":"view","type":"function"},{"name":"calc_withdraw_one_coin","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"_burn_amount"},{"type":"int128","name":"i"},{"type":"bool","name":"_previous"}],"stateMutability":"view","type":"function"},{"name":"remove_liquidity_one_coin","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"_burn_amount"},{"type":"int128","name":"i"},{"type":"uint256","name":"_min_received"}],"stateMutability":"nonpayable","type":"function"},{"name":"remove_liquidity_one_coin","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"_burn_amount"},{"type":"int128","name":"i"},{"type":"uint256","name":"_min_received"},{"type":"address","name":"_receiver"}],"stateMutability":"nonpayable","type":"function"},{"name":"ramp_A","outputs":[],"inputs":[{"type":"uint256","name":"_future_A"},{"type":"uint256","name":"_future_time"}],"stateMutability":"nonpayable","type":"function","gas":152464},{"name":"stop_ramp_A","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":149225},{"name":"admin_balances","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"i"}],"stateMutability":"view","type":"function","gas":3601},{"name":"withdraw_admin_fees","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":11347},{"name":"admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2141},{"name":"coins","outputs":[{"type":"address","name":""}],"inputs":[{"type":"uint256","name":"arg0"}],"stateMutability":"view","type":"function","gas":2280},{"name":"balances","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"arg0"}],"stateMutability":"view","type":"function","gas":2310},{"name":"fee","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2231},{"name":"block_timestamp_last","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2261},{"name":"initial_A","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2291},{"name":"future_A","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2321},{"name":"initial_A_time","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2351},{"name":"future_A_time","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2381},{"name":"name","outputs":[{"type":"string","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":8813},{"name":"symbol","outputs":[{"type":"string","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":7866},{"name":"balanceOf","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":2686},{"name":"allowance","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"arg0"},{"type":"address","name":"arg1"}],"stateMutability":"view","type":"function","gas":2931},{"name":"totalSupply","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2531}]'
);
const { getTokenPriceCoinGecko } = require("../config/bella/utilities.js");

let coins = [
  "0x6b175474e89094c44da98b954eedeac495271d0f", //0 DAI
  "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9", //1 alUSD
  "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF", //2 ALCX
  "0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8", //3 Sushiswap ALCX-WETH LP Token
  "0xda816459f1ab5631232fe5e97a05bbbb94970c95", //4 yvDAI
  "0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c", //5 Curve alUSD-3crv LP token
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //6 WETH
  "0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6", //7 alETH
  "0xa258C4606Ca8206D8aA700cE2143D7db854D168c", //8 yvWETH
  "0xc9da65931abf0ed1b74ce5ad8c041c4220940368", //9 Saddle alETH LP token
];

let daiHolders = [
  "0xaB7A49B971AFdc7Ee26255038C82b4006D122086", //USDTransmuter
  "0xc21D353FF4ee73C572425697f4F5aaD2109fe35b", //USDAlchemist
  "0xeE69BD81Bd056339368c97c4B2837B4Dc4b796E7", //USDTransmuterB
];

let yvDaiHolders = [
  "0xb039eA6153c827e59b620bDCd974F7bbFe68214A", //USDYearnVaultAdapter (Alchemist)
  "0x6Fe02BE0EC79dCF582cBDB936D7037d2eB17F661", //USDYearnVaultAdapterWithIndirection (TransmuterB)
];

let wethHolders = [
  "0x9FD9946E526357B35D95Bcb4b388614be4cFd4AC", //ETHTransmuter
  "0xf8317BD5F48B6fE608a52B48C856D3367540B73B", //ETHAlchemist
];

let yvWethHolders = [
  "0x546E6711032Ec744A7708D4b7b283A210a85B3BC", //ETHYearnVaultAdapter (Alchemist)
  "0x6d75657771256C7a8CB4d475fDf5047B70160132", //ETHYearnVaultAdapter (Transmuter)
];

async function weiToFloat(wei) {
  wei = await new BigNumber(wei).div(10 ** 18).toPrecision();
  return parseFloat(wei);
}

async function getPricePerShareInFloat(contract) {
  let pricePerShare = await contract.methods.pricePerShare().call();
  pricePerShare = await weiToFloat(pricePerShare);
  return pricePerShare;
}

async function getBalInFloat(contract, user) {
  let balances = await contract.methods.balanceOf(user).call();
  balances = await weiToFloat(balances);
  return balances;
}

async function getTotalSupplyFloat(contract) {
  let supply = await contract.methods.totalSupply().call();
  supply = await weiToFloat(supply);
  return supply;
}

async function getVirtualPriceFloat(contract) {
  let virtualPrice = await contract.methods.get_virtual_price().call();
  virtualPrice = await weiToFloat(virtualPrice);
  return virtualPrice;
}
const stakingPool = "0xAB8e74017a8Cc7c15FFcCd726603790d26d7DeCa"; // Alchemix Staking Pools
const mcv2 = "0xEF0881eC094552b2e128Cf945EF17a6752B4Ec5d"; // MasterChefV2
const curveStakingPool = "0xb76256d1091e93976c61449d6e500d9f46d827d4"; // Curve Gauge ALCX Rewards

const daicontract = new web3.eth.Contract(abis.abis.minABI, coins[0]);
const alusdcontract = new web3.eth.Contract(abis.abis.minABI, coins[1]);
const alcxcontract = new web3.eth.Contract(abis.abis.minABI, coins[2]);
const alcxlpcontract = new web3.eth.Contract(abis.abis.minABI, coins[3]);
const yvDAIContract = new web3.eth.Contract(abis.abis.minYvV2, coins[4]);
const alUSDCurveLPContract = new web3.eth.Contract(curveAbi, coins[5]);
const wethcontract = new web3.eth.Contract(abis.abis.minABI, coins[6]);
const alethContract = new web3.eth.Contract(abis.abis.minABI, coins[7]);
const yvWethContract = new web3.eth.Contract(abis.abis.minYvV2, coins[8]);
const alETHSaddleLPContract = new web3.eth.Contract(
  abis.abis.minABI,
  coins[9]
);
async function dai(tvl) {
  let pricePerYvDai = await getPricePerShareInFloat(yvDAIContract);

  // Get DAI TVL
  //Get total DAI TVL from transmuter and alchemist contracts
  for (let i = 0; i < daiHolders.length; i++) {
    let daibal = await getBalInFloat(daicontract, daiHolders[i]);
    tvl += daibal;
  }
  //Get total DAI TVL from yvDAI holders
  for (let i = 0; i < yvDaiHolders.length; i++) {
    let ydaibal = await getBalInFloat(yvDAIContract, yvDaiHolders[i]);
    tvl += ydaibal * pricePerYvDai;
  }
  return tvl;
}
async function eth() {
  const pricePerYvWeth = await getPricePerShareInFloat(yvWethContract);

  let totalEth = 0;

  // Get ETH TVL
  //Get total ETH TVL from transmuter and alchemist contracts
  for (let i = 0; i < wethHolders.length; i++) {
    let ethbal = await getBalInFloat(wethcontract, wethHolders[i]);
    totalEth += ethbal;
  }
  //Get total ETH TVL from yvWETH holders
  for (let i = 0; i < yvWethHolders.length; i++) {
    let yethbal = await getBalInFloat(yvWethContract, yvWethHolders[i]);
    totalEth += yethbal * pricePerYvWeth;
  }
  return totalEth
}
async function alcx() {
  //Get total amount of ALCX staked in staking pool
  const stakedALCX = await getBalInFloat(alcxcontract, stakingPool);
  //Convert ALCX to USD Via coingecko
  const baseTokenPriceInUsd = await getTokenPriceCoinGecko("usd")("alchemix");
  return stakedALCX * baseTokenPriceInUsd;
}
async function lp(tvl, ethPriceInUsd) {
/*  
  //Get total amount of SLP staked in staking contract
  const stakedLPPool = await getBalInFloat(alcxlpcontract, stakingPool);
  const stakedLPMCV2 = await getBalInFloat(alcxlpcontract, mcv2);
  const stakedLP = stakedLPPool + stakedLPMCV2; // Add up tokens in original pool plus tokens in mcv2
  //Get amount of ALCX in lp shares
  const totalLP = await getTotalSupplyFloat(alcxlpcontract);
  let shareOfTotalStaked = stakedLP / totalLP; //Gets ratio of total staked
  //Get total ALCX in lp token
  const totalALCXinLP = await getBalInFloat(alcxcontract, coins[3]);
  let totalALCXShareInLP = shareOfTotalStaked * totalALCXinLP;
  //Get approx tvl from lp staking by doubling the alcx * usd price
  let slpTVL = totalALCXShareInLP * 2 * baseTokenPriceInUsd;
  tvl += slpTVL;
*/
  //Get total amount of CLP staked in staking contract
  const stakedCLPPool = await getBalInFloat(alUSDCurveLPContract, stakingPool);
  const stakedCLPGauge = await getBalInFloat(
    alUSDCurveLPContract,
    curveStakingPool
  );
  const stakedCLP = stakedCLPPool + stakedCLPGauge;

  let virtualPrice;
  try {
    virtualPrice = await getVirtualPriceFloat(alUSDCurveLPContract);
  } catch (err) {
    virtualPrice = 1;
    console.error(err);
  }
  let curveTVL = stakedCLP * virtualPrice;
  tvl += curveTVL;

  // get total amount of alETH LP staked in staking contracts
  const stakedALETHLP = await getBalInFloat(alETHSaddleLPContract, stakingPool);
  tvl += stakedALETHLP * ethPriceInUsd;
  // Get total amount of alUSD staked in staking contract
  const stakedAlUSD = await getBalInFloat(alusdcontract, stakingPool);
  tvl += stakedAlUSD;

  return tvl;
}
async function fetch() {
  let tvl = await dai(0)
  const ethPriceInUsd = await getTokenPriceCoinGecko("usd")("ethereum");
  tvl += (await eth()) * ethPriceInUsd
  tvl += (await alcx())
  return lp(tvl, ethPriceInUsd)
}

module.exports = {
  fetch,
  eth
};
// node test.js projects/alchemix.js