const sdk = require("@defillama/sdk");
const { totalIssuedPynths } = require("./abi.json");

const BigNumber = require("bignumber.js");

const ethereum = "ethereum";
const polygon = "polygon";
const bsc = "bsc";
const base = "base";
const moonriver = "moonriver";
const moonbeam = "moonbeam";

const periFinanceContract = {
  ethereum: "0x0207157a7c154bFdEAD22751474c68660A4a540b",
  polygon: "0x8f151e700772d6e8Dc7dA8B260c9e0C3eCbF4174",
  bsc: "0x2Da103C31c4A80f828ea4158bD090e926003e8ad",
  base: "0x0f2Af7246e1FcbEC5e334092B1F0D91BDA924faD",
  moonriver: "0xB2f5Cd646Aab5f887150945576d51a8B5902F288",
  moonbeam: "0x0f2Af7246e1FcbEC5e334092B1F0D91BDA924faD",
};

const pUSD = "pUSD";
const tokenKey = "usd-coin";

const totalIssuedPynthByChain = async (chain) => {
  const currencyKey = rightPad(asciiToHex(pUSD), 64);

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
  base: {
    tvl: tvlByChain(base),
  },
  moonriver: {
    tvl: tvlByChain(moonriver),
  },
  moonbeam: {
    tvl: tvlByChain(moonbeam),
  },
};


/**
 * Should be called to get hex representation (prefixed by 0x) of ascii string
 *
 * @method asciiToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
 function asciiToHex (str)  {
  if(!str)
      return "0x00";
  var hex = "";
  for(var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      var n = code.toString(16);
      hex += n.length < 2 ? '0' + n : n;
  }

  return "0x" + hex;
}

/**
 * Should be called to pad string to expected length
 *
 * @method rightPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
function rightPad(string, chars, sign) {
  var hasPrefix = /^0x/i.test(string) || typeof string === 'number';
  string = string.toString(16).replace(/^0x/i,'');

  var padding = (chars - string.length + 1 >= 0) ? chars - string.length + 1 : 0;

  return (hasPrefix ? '0x' : '') + string + (new Array(padding).join(sign ? sign : "0"));
}