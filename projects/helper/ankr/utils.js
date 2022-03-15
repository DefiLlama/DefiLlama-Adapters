const BigNumber = require('bignumber.js');
const { toUSDTBalances } = require('../balances');

const createWeb3 = (rpcUrl) => {
  const Web3 = require('web3');
  const web3Provider = new Web3.providers.HttpProvider(rpcUrl);
  return new Web3(web3Provider);
}

const ZERO = new BigNumber(0);

const ONE_COIN = 1e18;

const fromWei = (v) => {
  if (v) {
    return new BigNumber(v).div(1e18);
  }
  return new BigNumber(0);
};

const createContractObject = (address, abi, web3 = require('../../config/web3.js')) => {
  return {
    address,
    contract: address && abi && new web3.eth.Contract(abi, address),
  };
}

const getVautsTvl = async (vaults, getPrice) => {
  const vaultsMap = await Promise.all(vaults.map((item) => {
    return new Promise(async (resolve) => {
      const { contract: vaultContract } = item.vault;

      const underlyingBalanceWithInvestment = new BigNumber(
        await vaultContract.methods.underlyingBalanceWithInvestment().call()
      );

      const usd = await getPrice(item);

      resolve(usd.multipliedBy(underlyingBalanceWithInvestment));
    })
  }));
  return toUSDTBalances(vaultsMap.reduce((acc, item) => acc.plus(item), new BigNumber(ZERO)));
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const formatDecimal = (value, decimal = 18, numPoint = 4, precision = 2) => {
  const data = new BigNumber(value).dividedBy(new BigNumber(10).pow(decimal));
  if (data.isGreaterThan(1)) {
    return numberWithCommas(data.dp(precision, 1).toNumber());
  }
  return data.dp(numPoint, 1).toNumber();
};

const getReserves = async (pairContract) => {
  try {
    const { _reserve0, _reserve1, _blockTimestampLast } = await pairContract.methods.getReserves().call();
    return { reserve0: _reserve0, reserve1: _reserve1, blockTimestampLast: _blockTimestampLast };
  } catch {
    return { reserve0: '0', reserve1: '0' };
  }
};

const fetchPriceData = async (
  contract,
  viceVersa = false,
  multiplier = 1,
) => {
  const { reserve0, reserve1 } = await getReserves(contract);
  const isValid = !new BigNumber(reserve0).eq(ZERO) && !new BigNumber(reserve1).eq(ZERO);

  if (isValid) {
    return (viceVersa
      ? new BigNumber(reserve0).div(new BigNumber(reserve1))
      : new BigNumber(reserve1).div(new BigNumber(reserve0))
    ).times(multiplier);
  } else {
    return ZERO;
  }
};

const getTotalSupplyOf = async (contract) => {
  try {
    const amount = await contract.methods.totalSupply().call();
    return new BigNumber(amount);
  } catch (error) {
    console.log(error);
    return new BigNumber(0);
  }
};

const getBalanceOf = async (account, contract) => {
  try {
    const amount = await contract.methods.balanceOf(account).call();
    return new BigNumber(amount);
  } catch (error) {
    return new BigNumber(0);
  }
};

module.exports = {
  ZERO,
  ONE_COIN,
  fromWei,
  createContractObject,
  getVautsTvl,
  createWeb3,
  formatDecimal,
  numberWithCommas,
  fetchPriceData,
  getReserves,
  getTotalSupplyOf,
  getBalanceOf,
}