const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const archWeb3abi = require("./archWeb3Abi.json");
const uniswapV3abi = require("./uniswapV3Abi.json");

const BigNumber = require("bignumber.js");

const archEthereumWeb3AddressETH = "0xe8e8486228753E01Dbc222dA262Aa706Bd67e601";
const archEthereumWeb3AddressPolygon = "0xBcD2C5C78000504EFBC1cE6489dfcaC71835406A";
const archEthereumWeb3AddressETHPool = "0x6147c54106dc2e3d7f5d4b5afd2804f2d30db0b5";

async function ethTvl(ts, block) {
  const archWeb3TotalSupply = await sdk.api.abi.call({
    block,
    target: archEthereumWeb3AddressETH,
    abi: archWeb3abi["totalSupply"],
  });

  let price = await getArchWeb3Price();

  const supply = toNumberString({
    number: archWeb3TotalSupply.output,
    shiftDecimalPositionToLeftBy: 18,
  });
  
  return Number(supply) * price;
}

async function polygonTvl(ts, block) {
  const archWeb3TotalSupply = await sdk.api.abi.call({
    block,
    target: archEthereumWeb3AddressPolygon,
    abi: archWeb3abi["totalSupply"],
    chain: 'polygon',
  });

  let price = await getArchWeb3Price();

  const supply = toNumberString({
    number: archWeb3TotalSupply.output,
    shiftDecimalPositionToLeftBy: 18,
  });

  return Number(supply) * price;
}

async function getArchWeb3Price(block) {
  const ethPriceInUsd = (await utils.getPricesfromString("ethereum")).data.ethereum
    .usd;
  const { output: slot0 } = await sdk.api.abi.call({
    block,
    target: archEthereumWeb3AddressETHPool,
    abi: uniswapV3abi.find(i => i.name === 'slot0')
  });
  const priceSqrt = new BigNumber(slot0[0]);
  const archWeb3PriceInEth = ((priceSqrt * priceSqrt) / (2 ** 192)) ** -1;

  let archWeb3Price = Number(archWeb3PriceInEth) * ethPriceInUsd;
  return archWeb3Price;
}

function toNumberString({
  number,
  shiftDecimalPositionToLeftBy,
}) {
  return new BigNumber(number)
    .dividedBy(10 ** shiftDecimalPositionToLeftBy)
    .toFormat({ decimalSeparator: '.', groupSeparator: '' });
}


module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  polygon: {
    tvl: polygonTvl,
  }
};