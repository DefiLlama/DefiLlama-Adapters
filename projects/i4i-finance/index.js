const BigNumber = require('bignumber.js');
const HELPER_ABI = require("./abi.json");
const REGISTRY_ABI = require("./PoolRegistry.json");
const Caver = require("caver-js");
const { toUSDTBalances } = require("../helper/balances");

const KOKOA_EP_URL = "https://public-node-api.klaytnapi.com/v1/cypress";
const REGISTRY_ADDR = "0xBd21dD5BCFE28475D26154935894d4F515A7b1C0";

const calcPoolLiquidityVolume = async (Helper, poolAddr, decimal) => {
  const {tokens, balances, prices} = await Helper.methods.getPoolPriceInfo(poolAddr).call();
  let sum = BigNumber(0);
  for (let i = 0; i < tokens.length; i++) {
    const tvl = BigNumber(prices[i]).dividedBy(BigNumber(10).pow(decimal)).multipliedBy(BigNumber(balances[i])).dividedBy(BigNumber(10).pow(decimal));
    sum = sum.plus(tvl);
  }
  return sum;
}

const fetchLiquidity = async () => {
  //TVL of all liquidity pools of the protocol
  const caver = new Caver(KOKOA_EP_URL);
  const Helper = new caver.contract(HELPER_ABI.abi, HELPER_ABI.address);
  const Registry = new caver.contract(REGISTRY_ABI, REGISTRY_ADDR);
  const decimal = 18;
  const poolList = await Registry.methods.getPoolList().call();

  let total = BigNumber(0);
  for (const pool of poolList){
    const poolVolume = await calcPoolLiquidityVolume(Helper, pool, decimal);
    total = total.plus(await calcPoolLiquidityVolume(Helper, pool, decimal));
  }
  return toUSDTBalances(total.toFixed(2));
}

const fetchStakedToken = async () => {
  //calculate staked EYE tvl using real-time EYE price in EYE-KSD LP pool
  const caver = new Caver(KOKOA_EP_URL);
  const Helper = new caver.contract(HELPER_ABI.abi, HELPER_ABI.address);
  const result = await Helper.methods.getStakedEyePriceInfo().call();
  const decimal = 18;
  const stakedEyeTVL = (BigNumber(result.price)).dividedBy(BigNumber(10).pow(decimal)).multipliedBy(BigNumber(result.balance)).dividedBy(BigNumber(10).pow(decimal));
  return toUSDTBalances(stakedEyeTVL.toFixed(2));
}

module.exports = {
  timetravel: false,
  klaytn:{
    staking: fetchStakedToken,
    tvl: fetchLiquidity
  },
  methodology:
    "tvl is calculated using the total value of protocol's liquidity pool. Staked tokens include staked EYE values. Pool2 includes staked lp tokens eligible for EYE emissions"
}