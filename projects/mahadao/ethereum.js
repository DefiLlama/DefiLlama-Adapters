const { unwrapTroves, sumTokens } = require("../helper/unwrapLPs.js");
const getEntireSystemCollAbi = require("../helper/abis/getEntireSystemColl.abi.json");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");

const chain = "ethereum";

const eth = {
  "sushiswap.eth/maha": "0xB73160F333b563f0B8a0bcf1a25ac7578A10DE96",
  "uniswapv2.eth/maha": "0xC0897d6Ba893E31F42F658eeAD777AA15B8f824d",

  "uniswapv3.eth/maha": "0x81ec0cbe58bc6df61aa632dc99beb6f87f0e2a17",
  "uniswapv3.dai/maha": "0x8cb8f052e7337573cd59d33bb67b2acbb65e9876",
  "uniswapv3.arth/maha": "0xc5ee69662e7ef79e503be9d54c237d5aafac305d",
  "uniswapv3.arth/usdc": "0x031a1d307c91fbde01005ec2ebc5fcb03b6f80ab",
  "uniswapv3.arth/eth": "0xfd6c2a0674796d0452534846f4c90923352c716b",

  maha: "0xb4d930279552397bba2ee473229f89ec245bc365",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  usdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  dai: "0x6b175474e89094c44da98b954eedeac495271d0f",
  arth: "0x8CC0F052fff7eaD7f2EdCCcaC895502E884a8a71",
};

const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
const TROVE_MANAGER_ADDRESS = "0xF4eD5d0C3C977B57382fabBEa441A63FAaF843d3";

Object.keys(eth).forEach((k) => (eth[k] = eth[k].toLowerCase()));

async function pool2(_, block) {
  const balances = {};

  // lp with the gov token inside
  await sumTokens(
    balances,
    [
      // sushiswap v2 ETH/MAHA
      [eth.weth, eth["sushiswap.eth/maha"]],
      [eth.maha, eth["sushiswap.eth/maha"]],

      // uniswap v2 ETH/MAHA
      [eth.weth, eth["uniswapv2.eth/maha"]],
      [eth.maha, eth["uniswapv2.eth/maha"]],

      // uniswap v3 ETH/MAHA
      [eth.weth, eth["uniswapv3.eth/maha"]],
      [eth.maha, eth["uniswapv3.eth/maha"]],

      // uniswap v3 ARTH/MAHA
      [eth.arth, eth["uniswapv3.arth/maha"]],
      [eth.maha, eth["uniswapv3.arth/maha"]],

      // uniswap v3 DAI/MAHA
      [eth.dai, eth["uniswapv3.dai/maha"]],
      [eth.maha, eth["uniswapv3.dai/maha"]],

      // uniswap v3 ARTH/ETH
      [eth.arth, eth["uniswapv3.arth/eth"]],
      [eth.weth, eth["uniswapv3.arth/eth"]],

      // uniswap v3 ARTH/USDC
      [eth.arth, eth["uniswapv3.arth/usdc"]],
      [eth.usdc, eth["uniswapv3.arth/usdc"]],
    ],
    block,
    chain
  );

  return balances;
}

async function tvl(_, block) {
  const troveEthTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block,
    })
  ).output;

  return {
    [ETH_ADDRESS]: troveEthTvl,
  };
}

module.exports = {
  pool2,
  tvl,
};
