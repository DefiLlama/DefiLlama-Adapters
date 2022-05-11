const sdk = require("@defillama/sdk");
const { utils: w3utils } = require("web3");
const { totalIssuedPynths } = require("./abi.json");

const BigNumber = require("bignumber.js");

const ethereum = "ethereum";
const polygon = "polygon";
const bsc = "bsc";

const periFinanceContract = {
  ethereum: "0x3a9a93A04eFB22e632632Ab584fF45DEB7321aC8",
  polygon: "0x7C4cE79655Ac1e84400bC5962b4B75c2b86Bd974",
  bsc: "0x82995a4170318f5E26CA6b650A337738dcc8114c",
};

const pUSD = "pUSD";
const tokenKey = "usd-coin";

const totalIssuedPynthByChain = async (chain) => {
  const currencyKey = w3utils.padRight(w3utils.asciiToHex(pUSD), 64);

  const { output: totalIssuedPynth } = await sdk.api.abi.call({
    abi: totalIssuedPynths,
    params: currencyKey,
    target: periFinanceContract[chain],
    chain,
  });
  return totalIssuedPynth;
};

const getTVL = (totalIssuedPynths) => {
  return BigNumber(totalIssuedPynths)
    .div(10 ** 18)
    .times(4);
};

const tvlByChain = (chain) => async (timestamp, block) => {
  const totalIssuedPynth = await totalIssuedPynthByChain(chain);

  const tvl = getTVL(totalIssuedPynth);

  // toFixed(0) just converts the numbers into strings
  return {
    [tokenKey]: tvl.toFixed(0),
  };
};

module.exports = {
  ethereum: {
    tvl: tvlByChain(ethereum),
  },
  bsc: {
    tvl: tvlByChain(bsc),
  },
  polygon: {
    tvl: tvlByChain(polygon),
  },
};
