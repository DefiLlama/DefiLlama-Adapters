const BigNumber = require('bignumber.js');
const { toUSDTBalances } = require('./../../../helper/balances');
const sdk = require("@defillama/sdk");

const { onxTokenContract,
  onxPoolContract,
  onsTokenContract,
  aethTokenContract,
  onsPoolsContracts,
  wethTokenContract,
  daiTokenContract,
  fraxTokenContract,
  usdcTokenContract } = require('../contract');
const tokenAddresses = require('../constant');
const { getVautsTvl, getBalanceOf, getReserves } = require('../../../helper/ankr/utils');
const { ZERO, vaults } = require('./vaults');
const { request, gql } = require("graphql-request");
const { getUsdBalance } = require('./farmTvl');
const { getWethPrice,
  getOnxPrice,
  getBondPrice,
  getAethPrice,
  getOnePrice,
  getOnsPrice,
  getAnkrPrice,
  getSushiPrice } = require('./prices');
const { farms } = require('./farms');

const getStakeTvl = async (onxPrice) => {
  const balance = new BigNumber(await onxTokenContract.methods.balanceOf(tokenAddresses.sOnx).call());
  return toUSDTBalances(onxPrice.times(balance).div(1e18));
}

const getEthereumStaking = async () => {
  const wethPrice = await getWethPrice();
  const onxPrice = (await getOnxPrice()).times(wethPrice);
  return getStakeTvl(onxPrice);
}

const getEthereumBorrows = async () => {
  const wethPrice = await getWethPrice();
  const borrowsTvl = new BigNumber(await onxPoolContract.methods.totalBorrow().call()).div(1e18);
  return toUSDTBalances(wethPrice.times(borrowsTvl));
}

const getOnePoolsTvl = async (price) => {
  let totalBalance = new BigNumber(0);
  let { onePools } = tokenAddresses;
  onePools = await Promise.all(
    onePools.map(async (farm) => {
      let balance = new BigNumber(0);
      let tokenBalance = new BigNumber();
      switch (farm.title) {
        case 'aeth':
          tokenBalance = new BigNumber(await aethTokenContract.methods.balanceOf(farm.address).call());
          balance = tokenBalance.times(price.aethPrice);
          break;
        case 'weth':
          tokenBalance = new BigNumber(await wethTokenContract.methods.balanceOf(farm.address).call());
          balance = tokenBalance.times(price.wethPrice);
          break;
        case 'onx':
          tokenBalance = new BigNumber(await onxTokenContract.methods.balanceOf(farm.address).call());
          balance = tokenBalance.times(price.onxPrice);
          break;
        case 'dai':
          tokenBalance = new BigNumber(await daiTokenContract.methods.balanceOf(farm.address).call());
          balance = tokenBalance.times(1);
          break;
        case 'frax':
          tokenBalance = new BigNumber(await fraxTokenContract.methods.balanceOf(farm.address).call());
          balance = tokenBalance.times(1);
          break;
        case 'usdc':
          tokenBalance = new BigNumber(await usdcTokenContract.methods.balanceOf(farm.address).call());
          balance = tokenBalance.times(1).div(1e6);
          break;
      }
      if (farm.title !== 'usdc') balance = balance.div(1e18);
      totalBalance = totalBalance.plus(balance);
    })
  );
  return totalBalance;
}

const getOnsPoolsTvl = async (price) => {
  let totalBalance = new BigNumber(0);
  let { onsPools } = tokenAddresses;
  onsPools = await Promise.all(
    onsPools.map(async (farm) => {
      let balance = new BigNumber(0);
      let sum = new BigNumber(0);
      const totalSupply = new BigNumber(await onsPoolsContracts[farm.title].methods.totalSupply().call());
      const tokenBalance = new BigNumber(await onsPoolsContracts[farm.title].methods.balanceOf(farm.address).call());
      const { reserve0, reserve1 } = await getReserves(onsPoolsContracts[farm.title]);

      if (farm.title === 'aethPairOne') {
        sum = new BigNumber(reserve0).times(price.aethPrice).plus(new BigNumber(reserve1).times(price.onePrice));
      } else if (farm.title === 'aethPairOns') {
        sum = new BigNumber(reserve0).times(price.aethPrice).plus(new BigNumber(reserve1).times(price.onsPrice));
      } else if (farm.title === 'aethPairEth') {
        sum = new BigNumber(reserve0).times(price.wethPrice).plus(new BigNumber(reserve1).times(price.aethPrice));
      }
      balance = sum.times(tokenBalance).div(totalSupply).div(1e18);
      totalBalance = totalBalance.plus(balance);
    })
  );
  return totalBalance;
}

const getOneVaultTvl = async (wethPrice, aethPrice, onsPrice) => {
  const onsValue = new BigNumber(
    await onsTokenContract.methods.balanceOf(tokenAddresses.oneVault).call()
  ).times(onsPrice).div(1e18);
  const aEthValue = new BigNumber(
    await aethTokenContract.methods.balanceOf(tokenAddresses.oneVault).call()
  ).times(aethPrice).div(1e18);
  return onsValue.plus(aEthValue);
}

const getLendingTvl = async (wethPrice) => {
  let totalStake = await onxPoolContract.methods.totalStake().call();
  let totalBorrow = await onxPoolContract.methods.totalPledge().call();
  return new BigNumber(totalBorrow).plus(totalStake).times(wethPrice).div(1e18);
}

const getQuickQuery = (pairAddress) => gql`
  query pairs {
    pairs(where: { id: "${pairAddress}"} ) {
        id
        reserveUSD
        trackedReserveETH
        volumeUSD
        untrackedVolumeUSD
        totalSupply
      }
    }`
  ;

const url = 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange';

const getPairsData = async (pairAddress) => {
  try {
    const result = await request(url, getQuickQuery(pairAddress));
    const last = result.pairs.length;
    return result && result.pairs ? result.pairs[last - 1] : {};
  } catch (e) {
    console.error(e);
  }

  return {};
};

const getSushiPoolPrice = async (vault) => {
  if (!vault.contract.address) {
    return ZERO;
  }

  const data = await await getPairsData(vault.contract.address);
  const { reserveUSD, totalSupply } = data;

  return new BigNumber(reserveUSD).div(totalSupply).div(1e18);
};

const getEthereumVautsTvl = async () => {
  return getVautsTvl(vaults, getSushiPoolPrice);
};

const getFarmsTvl = async (price) => {
  const { wethPrice, onxPrice, aethPrice, ankrPrice, bondPrice, sushiPrice } = price;

  let totalBalance = new BigNumber(0);
  await Promise.all(
    farms.map(async (farm) => {
      const address = !farm.isCustomFarmContract ? tokenAddresses.onxFarm : tokenAddresses.onxTripleFarm;
      const balance = await getBalanceOf(address, farm.contract);

      const usdBalance = await getUsdBalance(
        balance,
        farm,
        wethPrice,
        onxPrice,
        aethPrice,
        ankrPrice,
        sushiPrice,
        bondPrice
      );

      totalBalance = totalBalance.plus(usdBalance);
    })
  );
  return totalBalance;
}

const getOnxEthLpTvl = async () => {
  const wethPrice = await getWethPrice();
  const onxPrice = (await getOnxPrice()).times(wethPrice);
  const aethPrice = (await getAethPrice()).times(wethPrice);
  const ankrPrice = (await getAnkrPrice()).times(wethPrice);
  const bondPrice = (await getBondPrice()).times(wethPrice);
  const sushiPrice = (await getSushiPrice()).times(wethPrice);

  const farm = farms.find(farm => farm.pid === 4);

  const address = !farm.isCustomFarmContract ? tokenAddresses.onxFarm : tokenAddresses.onxTripleFarm;
  const balance = await getBalanceOf(address, farm.contract);

  const tvl = await getUsdBalance(
    balance,
    farm,
    wethPrice,
    onxPrice,
    aethPrice,
    ankrPrice,
    sushiPrice,
    bondPrice
  );

  return toUSDTBalances(tvl);
}

const getOnxEthSLpTvl = async () => {
  return getVautsTvl(vaults.filter(vault => vault.title === 'OnxEthSlp'), getSushiPoolPrice);
}

function getEthereumPoolTvl() {
  return sdk.util.sumChainTvls([getOnxEthLpTvl, getOnxEthSLpTvl]);
}

const getEthereumTvl = async () => {
  let netTvl = new BigNumber(0);

  const wethPrice = await getWethPrice();
  const onxPrice = (await getOnxPrice()).times(wethPrice);
  const aethPrice = (await getAethPrice()).times(wethPrice);
  const onsPrice = (await getOnsPrice()).times(aethPrice);
  const ankrPrice = (await getAnkrPrice()).times(wethPrice);
  const bondPrice = (await getBondPrice()).times(wethPrice);
  const sushiPrice = (await getSushiPrice()).times(wethPrice);

  const farmsTvl = await getFarmsTvl({ wethPrice, onxPrice, aethPrice, ankrPrice, bondPrice, sushiPrice });
  const onePoolsTvl = await getOnePoolsTvl({ aethPrice, wethPrice, onxPrice });
  const onePrice = (await getOnePrice()).times(aethPrice);
  const onsPoolsTvl = await getOnsPoolsTvl({ aethPrice, onePrice, onsPrice, wethPrice });
  const oneVaultTvl = await getOneVaultTvl(wethPrice, aethPrice, onsPrice);
  const lendingTvl = await getLendingTvl(wethPrice);

  const tvl = netTvl
    .plus(farmsTvl)
    .plus(lendingTvl)
    .plus(oneVaultTvl)
    .plus(onePoolsTvl)
    .plus(onsPoolsTvl);

  return toUSDTBalances(tvl);
}

function getEthereumTvlEx() {
  return sdk.util.sumChainTvls([getEthereumTvl, getEthereumVautsTvl]);
}

module.exports = {
  getEthereumStaking,
  getEthereumTvl,
  getEthereumTvlEx,
  getEthereumPoolTvl,
  getEthereumBorrows,
  getEthereumVautsTvl
}