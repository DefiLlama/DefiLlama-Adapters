const { default: axios } = require("axios");
const ethers = require("ethers");
const abi = require("./abi.json");
const apiInfo = require("./apiInfo.json");

async function getStakingValue(contract, stakingPoolAddress, divisor, price) {
  const stakingBalance =
    (await contract.balanceOf(stakingPoolAddress)) / divisor;
  const stakingValue = stakingBalance * price;
  console.log(`stakingValue : ${stakingValue}`);
  return stakingValue;
}

function getTotalDeposit(totalDeposit, divisor) {
  const td = totalDeposit / divisor;
  console.log(`totalDeposit: ${td}`);
  return td;
}

function getValueOfPool(balance, price) {
  const value = Number(balance) * price;
  console.log(`value ${value}`);
  return value;
}

// TODO : remove test, "test": "mocha", ->  "test": "echo \"Error: no test specified\" && exit 1",
const getTvl = async () => {
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

  const promiseArray = [
    axios.post(
      apiInfo["uniswap-v3-subgraph"].endpoint,
      apiInfo["uniswap-v3-subgraph"].body
    ),
    axios.post(
      apiInfo["elyfi-subgraph"].endpoint,
      apiInfo["elyfi-subgraph"].body
    ),
    axios.post(
      apiInfo["elyfi-subgraph-bsc"].endpoint,
      apiInfo["elyfi-subgraph-bsc"].body
    ),
    axios.get(apiInfo["coin-gecko"].endpoint),
  ];

  const [
    uniswapV3SubgraphCacheResponse,
    elyfiSubgraphCacheResponse,
    elyfiSubgraphBscCacheResponse,
    coinGeckoCacheResponse,
  ] = await Promise.all(promiseArray);
  const reserves = elyfiSubgraphCacheResponse.data.data.reserves;
  const bscReserves = elyfiSubgraphBscCacheResponse.data.data.reserves;
  const prices = coinGeckoCacheResponse.data;
  prices.elfi = {};
  prices.elfi.usd = Number(
    uniswapV3SubgraphCacheResponse.data.data.daiPool.poolDayData[0].token1Price
  );
  console.log(`elysia price : ${prices.elysia.usd}`);
  console.log(`elfi price : ${prices.elfi.usd}`);
  const daiPool = uniswapV3SubgraphCacheResponse.data.data.daiPool;
  const ethPool = uniswapV3SubgraphCacheResponse.data.data.ethPool;

  const elfiV1StakingValue = await getStakingValue(
    elfiContract,
    elfyV1StakingPoolAddress,
    1e18,
    prices.elfi.usd
  );

  const elfiV2StakingValue = await getStakingValue(
    elfiContract,
    elfyV2StakingPoolAddress,
    1e18,
    prices.elfi.usd
  );

  const elStakingValue = await getStakingValue(
    elContract,
    elStakingPoolAddress,
    1e18,
    prices.elysia.usd
  );

  const daiTotalDeposit = getTotalDeposit(reserves[0].totalDeposit, 1e18);
  const usdtTotalDeposit = getTotalDeposit(reserves[1].totalDeposit, 1e6);
  const busdTotalDeposit = getTotalDeposit(bscReserves[0].totalDeposit, 1e18);

  const elfiValueOfElfiDaiPool = getValueOfPool(
    daiPool.totalValueLockedToken0,
    prices.elfi.usd
  );
  const daiValueOfElfiDaiPool = getValueOfPool(
    daiPool.totalValueLockedToken1,
    1
  );
  const elfiValueOfElfiEthPool = getValueOfPool(
    ethPool.totalValueLockedToken0,
    prices.elfi.usd
  );
  const ethValueOfElfiEthPool = getValueOfPool(
    ethPool.totalValueLockedToken1,
    prices.ethereum.usd
  );

  const tvl =
    elfiV1StakingValue +
    elfiV2StakingValue +
    elStakingValue +
    daiTotalDeposit +
    usdtTotalDeposit +
    busdTotalDeposit +
    elfiValueOfElfiDaiPool +
    daiValueOfElfiDaiPool +
    elfiValueOfElfiEthPool +
    ethValueOfElfiEthPool;
  console.log(`tvl : ${tvl}`);
};

module.exports = {
  tvl: 1,
  getTvl,
};
