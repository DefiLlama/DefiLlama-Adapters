const BigNumber = require('bignumber.js');
const { toUSDTBalances } = require('../balances');
const vaultABI = require('./abis/TraderJoeVault.json');
const sdk = require("@defillama/sdk")
const UniswapV2PairContractAbi = require('./abis/UniswapV2Pair.json');

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

const getReserves = async (pairAddress) => {
  const { output: { _reserve0, _reserve1, _blockTimestampLast } } = await sdk.api.abi.call({
    target: pairAddress,
    abi: UniswapV2PairContractAbi.find(i => i.name === 'getReserves')
  })
  return { reserve0: _reserve0, reserve1: _reserve1, blockTimestampLast: _blockTimestampLast };
};


const getTotalSupplyOf = async (contract, chain) => {
  const { output: totalSupply } = await sdk.api.erc20.totalSupply({ target: contract })
  return new BigNumber(totalSupply);
};

const getBalanceOf = async (account, contract) => {
  const { output } = await sdk.api.erc20.balanceOf({ target: contract, owner: account, })
    return new BigNumber(output);
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