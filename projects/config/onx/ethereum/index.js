const BigNumber = require('bignumber.js');
const { onxTokenContract,
  usdtWethPairContract,
  onxWethSushiPairContract,
  onxPoolContract,
  aethPairOnsContract,
  aethPairOneContract,
  wethAethPairContract,
  onsTokenContract,
  aethTokenContract,
  ankrWethPairContract,
  bondPairEthContract,
  sushiPairEthContract,
  farmContracts,
  onsPoolsContracts,
  wethTokenContract,
  daiTokenContract,
  fraxTokenContract,
  usdcTokenContract,
  onxTripleFarmContract
} = require('../contract');
const tokenAddresses = require('../constant');
const { getVautsTvl } = require('../utils');
const { ZERO, vaults } = require('./vaults');
const { request, gql } = require("graphql-request");
const { getUsdBalance } = require('./farmTvl');

const getReserves = async (pairContract) => {
  try {
    const {
      _reserve0,
      _reserve1,
      _blockTimestampLast,
    } = await pairContract.methods.getReserves().call();
    return { reserve0: _reserve0, reserve1: _reserve1, blockTimestampLast: _blockTimestampLast };
  } catch {
    return { reserve0: '0', reserve1: '0' };
  }
};

const getWethPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(usdtWethPairContract);
  return new BigNumber(reserve1).times(1e12).div(new BigNumber(reserve0))
}

const getOnxPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(onxWethSushiPairContract);
  return new BigNumber(reserve0).div(new BigNumber(reserve1))
}

const getStakeTvl = async (onxPrice) => {
  const balance = new BigNumber(await onxTokenContract.methods.balanceOf(tokenAddresses.sOnx).call());
  return onxPrice.times(balance).div(1e18);
}

const getBondPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(bondPairEthContract);
  return new BigNumber(reserve1).div(new BigNumber(reserve0));
}

const getEthereumStaking = async () => {
  const wethPrice = await getWethPrice();
  const onxPrice = (await getOnxPrice()).times(wethPrice);
  const stakedTvl = await getStakeTvl(onxPrice);
  return stakedTvl;
}

const getAethPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(wethAethPairContract);
  return new BigNumber(reserve0).div(new BigNumber(reserve1))
  // return new BigNumber(reserve1).div(new BigNumber(reserve0))
}

const getOnePrice = async () => {
  const { reserve0, reserve1 } = await getReserves(aethPairOneContract);
  return new BigNumber(reserve1).div(new BigNumber(reserve0))
}

const getOnsPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(aethPairOnsContract);
  return new BigNumber(reserve0).div(new BigNumber(reserve1))
}

const getAnkrPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(ankrWethPairContract);
  return new BigNumber(reserve1).div(new BigNumber(reserve0));
}

const getSushiPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(sushiPairEthContract);
  return new BigNumber(reserve1).div(new BigNumber(reserve0));
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
  let totalBalance = new BigNumber(0);
  let { farms } = tokenAddresses;

  farms = await Promise.all(
    farms.map(async (farm) => {
      const address = !farm.isCustomFarmContract ? tokenAddresses.onxFarm : tokenAddresses.onxTripleFarm;

      const balance = new BigNumber(await farmContracts[farm.title].methods.balanceOf(address).call());

      const usdBalance = await getUsdBalance(
        balance,
        farm,
        price.wethPrice,
        price.onxPrice,
        price.aethPrice,
        price.ankrPrice,
        price.sushiPrice,
        price.bondPrice
      );

      totalBalance = totalBalance.plus(usdBalance);
    })
  );
  return totalBalance;
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
  
  const farmsTvl = await getFarmsTvl({ wethPrice, onxPrice, aethPrice, ankrPrice, bondPrice, sushiPrice }); //This brings +-1K$
  const stakedTvl = await getStakeTvl(onxPrice);
  const onePoolsTvl = await getOnePoolsTvl({ aethPrice, wethPrice, onxPrice });
  const onePrice = (await getOnePrice()).times(aethPrice);
  const onsPoolsTvl = await getOnsPoolsTvl({ aethPrice, onePrice, onsPrice, wethPrice });
  const oneVaultTvl = await getOneVaultTvl(wethPrice, aethPrice, onsPrice);
  const lendingTvl = await getLendingTvl(wethPrice);
  const vautsTvl = await getEthereumVautsTvl();

  const tvl = netTvl
    .plus(farmsTvl)
    .plus(stakedTvl)
    .plus(lendingTvl)
    .plus(oneVaultTvl)
    .plus(onePoolsTvl)
    .plus(onsPoolsTvl)
    .plus(vautsTvl);

  return tvl;
}

module.exports = {
  getOnePoolsTvl,
  getOnsPoolsTvl,

  getReserves,
  getEthereumStaking,
  getEthereumTvl,
}