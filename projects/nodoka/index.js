const sdk = require("@defillama/sdk");
const uniswapV3abi = require("./uniswapV3.json");

const BigNumber = require("bignumber.js");

const nethContract = "0xf2e51185caaded6c63d587943369f0b5df169344";
const nethPool = "0xdb5c6D2DE362606C2Fa84bc948fE0401ea11e207";

async function tvl(ts, block) {
  const nethTotalSupply = await sdk.api.abi.call({
    block,
    target: nethContract,
    abi: 'erc20:totalSupply',
  });

  let price = await getNethPrice();
  let supply = new BigNumber(nethTotalSupply.output).div(10 ** 18);
  return {
    ethereum: supply * price,
  };
}

async function getNethPrice(block) {
  const { output: slot0 } = await sdk.api.abi.call({
    block,
    target: nethPool,
    abi: uniswapV3abi.find(i => i.name === 'slot0')
  })
  const priceSqrt = new BigNumber(slot0[0]);
  const nethPriceInEth = (priceSqrt * priceSqrt) / 2 ** 192;

  return nethPriceInEth;
}

module.exports = {
  ethereum: {
    tvl,
  },
};
