const BigNumber = require('bignumber.js');
const { toUSDTBalances } = require('../balances');
const vaultABI = require('./abis/TraderJoeVault.json');
const sdk = require("@defillama/sdk")

const ZERO = new BigNumber(0);

const ONE_COIN = 1e18;

const fromWei = (v) => {
  if (v) {
    return new BigNumber(v).div(1e18);
  }
  return new BigNumber(0);
};

const getVautsTvl = async (vaults, getPrice) => {
  const vaultsMap = await Promise.all(vaults.map((item) => {
    return new Promise(async (resolve) => {
      const { vault, chain } = item
      let { output: underlyingBalanceWithInvestment } = await sdk.api.abi.call({
        chain,
        target: vault,
        abi: vaultABI.find(i => i.name === 'underlyingBalanceWithInvestment')
      })

      underlyingBalanceWithInvestment = new BigNumber(underlyingBalanceWithInvestment);

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
  getVautsTvl,
  formatDecimal,
  numberWithCommas,
  getReserves,
  getTotalSupplyOf,
  getBalanceOf,
}