const BigNumber = require('bignumber.js');

const createWeb3 = (rpcUrl) => {
  const Web3 = require('web3');
  const web3Provider = new Web3.providers.HttpProvider(rpcUrl);
  return new Web3(web3Provider);
}

const ZERO = new BigNumber(0);

const fromWei = (v) => {
  if (v) {
    return new BigNumber(v).div(1e18);
  }
  return new BigNumber(0);
};

const createContractObject = (address, abi, web3 = require('../web3.js')) => {
  return {
    address,
    contract: address && abi && new web3.eth.Contract(abi, address),
  };
}

const getNetworkTokenTvlUsd = async (vaults, getPrice, web3 = require('../web3.js')) => {
  const vaultsMap = await Promise.all(vaults.map((item) => {
    return new Promise(async (resolve) => {
      const { contract: vaultContract } = item.vault;

      const underlyingBalanceWithInvestment = new BigNumber(
        await vaultContract.methods.underlyingBalanceWithInvestment().call()
      );

      console.log(111, underlyingBalanceWithInvestment.toNumber());

      const usd = await getPrice(item);

      resolve(usd.multipliedBy(underlyingBalanceWithInvestment));
    })
  }));
  return vaultsMap.reduce((acc, item) => acc.plus(item), new BigNumber(ZERO));
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

module.exports = {
  ZERO,
  fromWei,
  createContractObject,
  getNetworkTokenTvlUsd,
  createWeb3,
  formatDecimal,
  numberWithCommas,
}