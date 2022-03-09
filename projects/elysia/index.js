const { default: axios } = require("axios");
const ethers = require("ethers");
const abi = require("./abi.json");
const apiInfo = require("./apiInfo.json");
const { toUSDTBalances } = require('../helper/balances');

const elfiAddress = "0x4da34f8264cb33a5c9f17081b9ef5ff6091116f4";
const elAddress = "0x2781246fe707bb15cee3e5ea354e2154a2877b16";
const elStakingPoolAddress = "0xd804e198d25a1920522ca0094a670184a9c972d7";
const elfyV1StakingPoolAddress = "0xb41bcd480fbd986331eeed516c52e447b50dacb4";
const elfyV2StakingPoolAddress = "0xCD668B44C7Cf3B63722D5cE5F655De68dD8f2750";
const infuraMainnetUrl =
  "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
const rpcProvider = new ethers.providers.JsonRpcProvider(infuraMainnetUrl, {
  name: "ethereum",
  chainId: 1,
});
const elfiContract = new ethers.Contract(elfiAddress, abi, rpcProvider);
const elContract = new ethers.Contract(elAddress, abi, rpcProvider);
let prices;
let uniswapV3SubgraphCacheResponse, coinGeckoCacheResponse;
// node test.js projects/elysia/index.js
(async () => {
  [uniswapV3SubgraphCacheResponse, coinGeckoCacheResponse] = await Promise.all([
    axios.post(
      apiInfo["uniswap-v3-subgraph"].endpoint,
      apiInfo["uniswap-v3-subgraph"].body
    ),
    axios.get(apiInfo["coin-gecko"].endpoint),
  ]);

  prices = coinGeckoCacheResponse.data;
  prices.elfi = {};
  prices.elfi.usd = Number(
    uniswapV3SubgraphCacheResponse.data.data.daiPool.poolDayData[0].token1Price
  );
})();

async function getStakingValue(
  contract,
  stakingPoolAddress,
  divisor,
  price,
  symbol
) {
  const stakingBalance =
    (await contract.balanceOf(stakingPoolAddress)) / divisor;
  const stakingValue = stakingBalance * price;
  console.log(`${symbol} stakingValue : ${stakingValue}`);
  return stakingValue;
}

function getTotalDeposit(totalDeposit, divisor, symbol) {
  const td = totalDeposit / divisor;
  console.log(`${symbol} totalDeposit: ${td}`);
  return td;
}

function getValueOfPool(balance, price, symbol) {
  const value = Number(balance) * price;
  console.log(`${symbol} : ${value}`);
  return value;
}

async function getBscTvl() {
  const elyfiSubgraphBscCacheResponse = await axios.post(
    apiInfo["elyfi-subgraph-bsc"].endpoint,
    apiInfo["elyfi-subgraph-bsc"].body
  );
  const bscReserves = elyfiSubgraphBscCacheResponse.data.data.reserves;

  const busdTotalDeposit = getTotalDeposit(
    bscReserves[0].totalDeposit,
    1e18,
    "busd"
  );
  const bscTvl = busdTotalDeposit;
  console.log(`getBscTvl bscTvl : ${bscTvl}`);
  return toUSDTBalances(bscTvl);
}

async function getEthereumStaking() {
  const [elfiV1StakingValue, elfiV2StakingValue] = await Promise.all([
    getStakingValue(
      elfiContract,
      elfyV1StakingPoolAddress,
      1e18,
      prices.elfi.usd,
      "elfiV1"
    ),
    getStakingValue(
      elfiContract,
      elfyV2StakingPoolAddress,
      1e18,
      prices.elfi.usd,
      "elfiV2"
    ),
  ]);

  const ethereumStaking = elfiV1StakingValue + elfiV2StakingValue;
  console.log(`getEthereumStaking ethereumStaking : ${ethereumStaking}`);
  return toUSDTBalances(ethereumStaking);
}

async function getPool2() {
  const daiPool = uniswapV3SubgraphCacheResponse.data.data.daiPool;
  const ethPool = uniswapV3SubgraphCacheResponse.data.data.ethPool;

  const elfiValueOfElfiDaiPool = getValueOfPool(
    daiPool.totalValueLockedToken0,
    prices.elfi.usd,
    "elfiValueOfElfiDaiPool"
  );
  const daiValueOfElfiDaiPool = getValueOfPool(
    daiPool.totalValueLockedToken1,
    1,
    "daiValueOfElfiDaiPool"
  );
  const elfiValueOfElfiEthPool = getValueOfPool(
    ethPool.totalValueLockedToken0,
    prices.elfi.usd,
    "elfiValueOfElfiEthPool"
  );
  const ethValueOfElfiEthPool = getValueOfPool(
    ethPool.totalValueLockedToken1,
    prices.ethereum.usd,
    "ethValueOfElfiEthPool"
  );

  const pool2 =
    elfiValueOfElfiDaiPool +
    daiValueOfElfiDaiPool +
    elfiValueOfElfiEthPool +
    ethValueOfElfiEthPool;
  console.log(`getPool2 pool2 : ${pool2}`);
  return toUSDTBalances(pool2);
}

const getEthereumTvl = async () => {
  const elyfiSubgraphCacheResponse = await axios.post(
    apiInfo["elyfi-subgraph"].endpoint,
    apiInfo["elyfi-subgraph"].body
  );
  const reserves = elyfiSubgraphCacheResponse.data.data.reserves;
  const daiTotalDeposit = getTotalDeposit(
    reserves[0].totalDeposit,
    1e18,
    "dai"
  );
  const usdtTotalDeposit = getTotalDeposit(
    reserves[1].totalDeposit,
    1e6,
    "usdt"
  );
  const elStakingValue = await getStakingValue(
    elContract,
    elStakingPoolAddress,
    1e18,
    prices.elysia.usd,
    "elysia"
  );
  const ethereumTvl = elStakingValue + daiTotalDeposit + usdtTotalDeposit;
  console.log(`getEthereumTvl ethereumTvl : ${ethereumTvl}`);
  return toUSDTBalances(ethereumTvl);
};

module.exports = {
  ethereum: {
    tvl: getEthereumTvl, // deposit,
    staking: getEthereumStaking, // elfi staking
    // lp with elfi
    pool2: getPool2,
  },
  bsc: {
    tvl: getBscTvl, // deposit
  },
};
