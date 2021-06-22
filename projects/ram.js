const retry = require("async-retry");
const Web3 = require("web3");
const BigNumber = require("bignumber.js");
const abis = require("./config/ram/abis.js");

const rpcUrl = "https://mainnet-rpc.thundercore.com";
const controllerAddress = "0x0d4fe8832857Bb557d8CFCf3737cbFc8aE784106";

function fetch() {
  return retry(async () => await getTVL());
}

async function getTVL() {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  const controller = new web3.eth.Contract(
    abis.abis.controller,
    controllerAddress
  );
  const oracleAddress = await controller.methods.oracle().call();
  const oracle = new web3.eth.Contract(abis.abis.oracle, oracleAddress);
  const markets = await controller.methods.getAllMarkets().call();
  const sum = await getMarketsTotalSupply(web3, markets, oracle);
  return sum;
}

async function getTokenValue(tokenContract, oracle) {
  const [totalSupply, rate, price] = await Promise.all([
    tokenContract.methods.totalSupply().call(),
    tokenContract.methods.exchangeRateCurrent().call(),
    oracle.methods.getUnderlyingPrice(tokenContract.options.address).call(),
  ]);
  const tokenPrice = new BigNumber(price);
  const valueLocked = tokenPrice
    .multipliedBy(totalSupply)
    .multipliedBy(rate)
    .div(10 ** 54);
  return valueLocked;
}

async function getMarketsTotalSupply(web3, markets, oracle) {
  const tokenContracts = markets.map(
    (market) => new web3.eth.Contract(abis.abis.rtoken, market)
  );
  const values = await Promise.all(
    tokenContracts.map((tokenContract) => getTokenValue(tokenContract, oracle))
  );
  const value = values.reduce((accu, cur) => accu.plus(cur), new BigNumber(0));
  return value.toNumber();
}

module.exports = {
  fetch,
};
