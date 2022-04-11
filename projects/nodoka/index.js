const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const web3 = require("../config/web3.js");
const nethabi = require("./neth.json");
const uniswapV3abi = require("./uniswapV3.json");

const BigNumber = require("bignumber.js");

const nethContract = "0xf2e51185caaded6c63d587943369f0b5df169344";
const nethPool = "0xdb5c6D2DE362606C2Fa84bc948fE0401ea11e207";

async function fetch() {
  const nethTotalSupply = await sdk.api.abi.call({
    target: nethContract,
    abi: nethabi["totalSupply"],
  });

  let price = await getNethPrice();
  let supply = new BigNumber(nethTotalSupply.output).div(10 ** 18);
  return supply * price;
}

async function getNethPrice() {
  const ethPrice = (await utils.getPricesfromString("ethereum")).data.ethereum
    .usd;
  let uniV3 = new web3.eth.Contract(uniswapV3abi, nethPool);

  const slot0 = await uniV3.methods.slot0.call().call();
  const priceSqrt = new BigNumber(slot0[0]);
  const nethPriceInEth = (priceSqrt * priceSqrt) / 2 ** 192;

  let nethPrice = Number(nethPriceInEth) * ethPrice;
  return nethPrice;
}

module.exports = {
  ethereum: {
    fetch,
  },
  fetch,
};
