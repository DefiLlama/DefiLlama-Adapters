const { ethers } = require("ethers");
const { OvixABI, unitrollerABI, erc20ABI, oracleABI } = require("./Abis");
const { PROVIDER } = require("./Provider");
const sdk = require("@defillama/sdk");
const { getBlock } = require("../helper/getBlock");

const unitroller = "0x8849f1a0cB6b5D6076aB150546EddEe193754F1C";
const oracleContract = "0x1c312b14c129EabC4796b0165A2c470b659E5f01";

async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, chain, chainBlocks, true);
  let balances = {};
  let tokenTvl;

  // retrieve up-to-date tokens list
  const strategiesList = await getAllMarkets();

  for (let strategy of strategiesList) {
    tvl = await getErc20Balances(strategy);

    balances["polygon:" + strategy.toString()] = tvl.toString();
  }
  console.log(balances);
  return balances;
}

// retrieve all token markets
async function getAllMarkets() {
  const unitrollerContract = new ethers.Contract(
    unitroller,
    unitrollerABI,
    PROVIDER
  );

  // get all the oToken addresses from the unitroller contract
  const allMarkets = await unitrollerContract.getAllMarkets();

  return allMarkets;
}

async function getErc20Balances(strategy) {
  // retrieve the asset contract
  const oTokenContract = new ethers.Contract(strategy, OvixABI, PROVIDER);

  // get decimals for the oToken
  const oDecimals = parseInt(await oTokenContract.decimals());

  // get the total supply
  const oTokenTotalSupply = await oTokenContract.totalSupply();

  // get the exchange rate stored
  const oExchangeRateStored = await oTokenContract.exchangeRateStored();

  // // get the contract for the underlying token
  const underlyingTokenAddress = new ethers.Contract(
    strategy,
    erc20ABI,
    PROVIDER
  );

  // retrieve the oracle contract
  const oracle = new ethers.Contract(oracleContract, oracleABI, PROVIDER);

  // get the decimals for the underlying token
  const underlyingDecimals = parseInt(await underlyingTokenAddress.decimals());

  // get the underlying price of the asset from the oracle
  const oracleUnderlyingPrice = Number(
    await oracle.getUnderlyingPrice(strategy)
  );

  // do the conversions
  return convertTvlUSDnoDecimals(
    oTokenTotalSupply,
    oExchangeRateStored,
    oDecimals,
    underlyingDecimals,
    oracleUnderlyingPrice
  );
}

function convertUSDC(balance, exchangeRateStored, decimals) {
  return (
    (parseFloat(balance) * parseFloat(exchangeRateStored)) /
    Math.pow(1, Math.pow(10, decimals)) /
    Math.pow(1, Math.pow(10, 18))
  );
}

function convertTvlUSDnoDecimals(
  totalSupply,
  exchangeRateStored,
  oDecimals,
  underlyingDecimals,
  oracleUnderlyingPrice
) {
  return totalSupply * exchangeRateStored;
}

module.exports = {
  polygon: {
    tvl,
  },
  methodology:
    "Count balance of erc20 underlying of each market, plus matic balance of the oMATIC market",
};

// tvl();
