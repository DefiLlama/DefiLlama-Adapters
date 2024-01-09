const ERC20ABI = require("./abis/ERC20.json")
const ethers = require('ethers')
const sdk = require("@defillama/sdk");
const pancakesdk = require("@pancakeswap/v3-sdk");
const pancakev1Sdk = require("@pancakeswap/sdk");
const getNativeToken = require('./chainData.js');
const CakepieReaderAbi = require("./abis/CakepieReader.json");
const MasterCakepieAbi = require("./abis/MasterCakepie.json");
const config = require("./config")
const _ = require("lodash");
const { ADDRESS_ZERO } = require("@pancakeswap/v3-sdk");

var WETHToken = "";
var balances = {};

async function getERC20TokenInfo(api, token) {
  const tokenInfo = { "tokenAddress": "", "symbol": "", "decimals": 0 };
  if (token == "0x0000000000000000000000000000000000000000") return tokenInfo;
  tokenInfo.tokenAddress = token;
  if (token == "0x0000000000000000000000000000000000000001") {
    tokenInfo.symbol = "ETH";
    tokenInfo.decimals = 18;
    return tokenInfo;
  }
  tokenInfo.symbol = await api.call({ abi: 'erc20:symbol', target: token })
  tokenInfo.decimals = await api.call({ abi: ERC20ABI.decimals, target: token })
  return tokenInfo;
}

async function fetchTVLFromSubgraph(
  api,
  pancakeStaking,
  pool
) {
  const response = await fetch(
    `https://api.thegraph.com/subgraphs/name/pancakeswap/masterchef-v3-bsc`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      {
        userPositions(
          first: 1000,
          where: {user_: {address: "${pancakeStaking.toLowerCase()}"}, pool_: {v3Pool: "${pool.poolAddress.toLowerCase()}"},  isStaked: true}
        ) {
          tickLower
          tickUpper
          liquidity
          id
          user {
            address
          }
          pool {
            v3Pool
          }
        }
      }
      `,
      }),
    }
  );
  const result = await response.json();
  if (result.data && result.data.userPositions) {
    const positionIDList = result.data.userPositions.map(item => {
      return item.id
    })
    if (positionIDList.length > 0) {
      const positionChunkIDList = _.chunk(positionIDList, 100);
      let liquidityList = [];
      for (let m = 0, n = positionChunkIDList.length; m < n; m++) {
        const liquidityListResponse = await fetch(
          `https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
              {
                positions (where: { id_in: [${positionChunkIDList[m].join(",")}] }) {
                  liquidity 
                  tickLower {
                    tickIdx
                  } 
                  tickUpper {
                    tickIdx
                  } 
                  pool {
                    id
                  }
                }
              }
            `,
            }),
          }
        );
        const result = await liquidityListResponse.json()
        liquidityList = liquidityList.concat(result.data.positions);
      }

      for (let i = 0, l = liquidityList.length; i < l; i++) {
        const userPosition = liquidityList[i];
        if (Number(userPosition.liquidity) === 0) {
          continue;
        }
        const pos = new pancakesdk.Position({
          pool: pool.v3PoolInfo.v3SDKPool,
          tickLower: Number(userPosition.tickLower.tickIdx),
          tickUpper: Number(userPosition.tickUpper.tickIdx),
          liquidity: BigInt(userPosition.liquidity),
        });
        const token0Amount = ethers.utils.parseUnits(
          pos.amount0.toFixed(),
          pool.v3PoolInfo.token0.decimals
        );
        const token1Amount = ethers.utils.parseUnits(
          pos.amount1.toFixed(),
          pool.v3PoolInfo.token1.decimals
        );
        sdk.util.sumSingleBalance(balances, pool.v3PoolInfo.token0.tokenAddress, token0Amount, api.chain);
        sdk.util.sumSingleBalance(balances, pool.v3PoolInfo.token1.tokenAddress, token1Amount, api.chain);
      }
    }
  }
}

async function getV3PoolInfo(
  api,
  V3poolInfo,
  PancakeStaking,
  masterChefV3,
  pancakeV3Helper,
  v3FARM_BOOSTER
) {
  var cakepiePool = {};
  cakepiePool.poolAddress = V3poolInfo.poolAddress;
  cakepiePool.totalStaked = V3poolInfo.v3Liquidity;
  cakepiePool.helper = pancakeV3Helper;
  cakepiePool.isActive = V3poolInfo.isActive;
  cakepiePool.poolType = V3poolInfo.poolType;
  var v3PoolInfo = {};
  const pid = await api.call({ abi: CakepieReaderAbi.v3PoolAddressPid, target: masterChefV3, params: V3poolInfo.poolAddress })
  var token0;
  var token1;
  var fee;
  var poolInfo = await api.call({ abi: CakepieReaderAbi.poolInfo, target: masterChefV3, params: pid });
  v3PoolInfo.allocPoint = poolInfo.allocPoint
  v3PoolInfo.v3Pool = poolInfo.v3Pool
  token0 = poolInfo.token0
  token1 = poolInfo.token1
  fee = poolInfo.fee
  v3PoolInfo.totalLiquidity = poolInfo.totalLiquidity
  v3PoolInfo.totalBoostLiquidity = poolInfo.totalBoostLiquidity
  temptoken0 = await getERC20TokenInfo(api, token0);
  temptoken1 = await getERC20TokenInfo(api, token1);
  const token0Token = new pancakev1Sdk.Token(
    api.chainId,
    token0,
    parseInt(temptoken0.decimals, 10),
    temptoken0.symbol,
    temptoken0.symbol
  );
  const token1Token = new pancakev1Sdk.Token(
    api.chainId,
    token1,
    parseInt(temptoken1.decimals, 10),
    temptoken1.symbol,
    temptoken1.symbol
  );
  v3PoolInfo.token0 = token0Token
  v3PoolInfo.token0.tokenAddress = token0Token.address;
  if (v3PoolInfo.token0.tokenAddress == WETHToken) {
    v3PoolInfo.token0.isNative = true;
  }
  v3PoolInfo.token0.symbol = v3PoolInfo.token0.isNative
    ? await getNativeToken(api.chainId)
    : v3PoolInfo.token0.symbol

  v3PoolInfo.token1 = token1Token
  v3PoolInfo.token1.tokenAddress = token1Token.address;
  if (v3PoolInfo.token1.tokenAddress == WETHToken) {
    v3PoolInfo.token1.isNative = true;
  }
  v3PoolInfo.token1.symbol = v3PoolInfo.token1.isNative
    ? await getNativeToken(api.chainId)
    : v3PoolInfo.token1.symbol

  v3PoolInfo.pid = pid;
  var slot0 = {}
  var slot = await api.call({ abi: CakepieReaderAbi.slot0, target: V3poolInfo.poolAddress });
  slot0.sqrtPriceX96 = slot.sqrtPriceX96
  slot0.tick = slot.tick
  slot0.observationIndex = slot.observationIndex
  slot0.observationCardinality = slot.observationCardinality
  slot0.observationCardinalityNext = slot.observationCardinalityNext
  slot0.feeProtocol = slot.feeProtocol
  slot0.unlocked = slot.unlocked;
  v3PoolInfo.slot0 = slot0;
  v3PoolInfo.fee = await api.call({ abi: CakepieReaderAbi.fee, target: V3poolInfo.poolAddress });
  v3PoolInfo.liquidity = await api.call({ abi: CakepieReaderAbi.liquidity, target: V3poolInfo.poolAddress });
  v3PoolInfo.lmPool = await api.call({ abi: CakepieReaderAbi.lmPool, target: V3poolInfo.poolAddress });
  v3PoolInfo.lmLiquidity = await api.call({ abi: CakepieReaderAbi.lmLiquidity, target: v3PoolInfo.lmPool });
  v3PoolInfo.farmCanBoost = await api.call({ abi: CakepieReaderAbi.whiteList, target: v3FARM_BOOSTER, params: pid });
  cakepiePool.v3PoolInfo = v3PoolInfo;
  cakepiePool.v3AccountInfo = await getV3AccountInfo(api, cakepiePool, PancakeStaking);
  const v3Pool = new pancakesdk.Pool(
    token0Token,
    token1Token,
    parseInt(v3PoolInfo.fee, 10),
    v3PoolInfo.slot0.sqrtPriceX96,
    v3PoolInfo.liquidity,
    v3PoolInfo.slot0.tick,
    []
  );
  cakepiePool.v3PoolInfo.v3SDKPool = v3Pool;
  return cakepiePool;
}

async function getV3AccountInfo(
  api,
  pool,
  PancakeStaking
) {
  var v3Info = {};
  var token0 = pool.v3PoolInfo.token0.tokenAddress;
  var token1 = pool.v3PoolInfo.token1.tokenAddress;
  if (pool.v3PoolInfo.token0.isNative == true) {
    v3Info.token0Balance = PancakeStaking.balance;
    v3Info.token0V3HelperAllowance = ethers.MaxUint256;
  } else {
    v3Info.token0Balance = await api.call({ abi: ERC20ABI.balanceOf, target: token0, params: PancakeStaking });
    v3Info.token0V3HelperAllowance = await api.call({ abi: ERC20ABI.allowance, target: token0, params: [PancakeStaking, pool.helper] });
  }
  if (pool.v3PoolInfo.token1.isNative == true) {
    v3Info.token1Balance = PancakeStaking.balance;
    v3Info.token1V3HelperAllowance = ethers.MaxUint256;
  } else {
    v3Info.token1Balance = await api.call({ abi: ERC20ABI.balanceOf, target: token1, params: PancakeStaking });
    v3Info.token1V3HelperAllowance = await api.call({ abi: ERC20ABI.allowance, target: token1, params: [PancakeStaking, pool.helper] });
  }
  return v3Info;
}


async function getPoolInfo(api, PancakeStaking, masterChefV3, pancakeV3Helper, v3FARM_BOOSTER) {
  let poolsAdd = await api.fetchList({ lengthAbi: CakepieReaderAbi.poolLength, itemAbi: CakepieReaderAbi.poolList, target: PancakeStaking })
  let poolsInfo = await api.multiCall({ abi: CakepieReaderAbi.pools, calls: poolsAdd, target: PancakeStaking })
  for (var i = 0; i < poolsAdd.length; i++) {
    let pool;
    if (poolsInfo[i].poolType == 1) {
      pool = await getV3PoolInfo(api, poolsInfo[i], PancakeStaking, masterChefV3, pancakeV3Helper, v3FARM_BOOSTER);
    } else if (poolsInfo[i].poolType == 2 || poolsInfo[i].poolType == 3) {
      pool = await getV2LikePoolInfo(poolsInfo[i], PancakeStaking);
    }
    await fetchTVLFromSubgraph(api, PancakeStaking, pool)
  }
}

async function tvl(timestamp, block, chainBlocks, { api }) {
  const { PancakeStaking, CakepieReader, MasterCakepieAddress, CakeAddress } = config[api.chain];
  WETHToken = await api.call({ abi: CakepieReaderAbi.weth, target: CakepieReader })
  const masterChefV3 = await api.call({ abi: CakepieReaderAbi.masterChefv3, target: CakepieReader })
  const pancakeV3Helper = await api.call({ abi: CakepieReaderAbi.pancakeV3Helper, target: CakepieReader })
  const v3FARM_BOOSTER = await api.call({ abi: CakepieReaderAbi.v3FARM_BOOSTER, target: CakepieReader })
  const mCake = await api.call({ abi: CakepieReaderAbi.mCake, target: CakepieReader })
  const mCakeSV = await api.call({ abi: CakepieReaderAbi.mCakeSV, target: CakepieReader })
  await getPoolInfo(api, PancakeStaking, masterChefV3, pancakeV3Helper, v3FARM_BOOSTER);
  const mCakePool = await api.call({ abi: MasterCakepieAbi.tokenToPoolInfo, target: MasterCakepieAddress, params :[mCake] })
  sdk.util.sumSingleBalance(balances, CakeAddress, mCakePool.totalStaked, api.chain);
  const mCakeSVPool = await api.call({ abi: MasterCakepieAbi.tokenToPoolInfo, target: MasterCakepieAddress, params:[mCakeSV] })
  sdk.util.sumSingleBalance(balances, CakeAddress, mCakeSVPool.totalStaked, api.chain);
  return balances
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: tvl,
    // staking: staking(CakepieReader)
  }
})