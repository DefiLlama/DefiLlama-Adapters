const { unwrapTroves, sumTokens } = require("../helper/unwrapLPs.js");
const getEntireSystemCollAbi = require("../helper/abis/getEntireSystemColl.abi.json");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");

const chain = "ethereum";

const eth = {
  ethMahaSLP: "0xB73160F333b563f0B8a0bcf1a25ac7578A10DE96",
  ethMahaUniV2LP: "0xC0897d6Ba893E31F42F658eeAD777AA15B8f824d",
  maha: "0xb4d930279552397bba2ee473229f89ec245bc365",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  arth: "0x8CC0F052fff7eaD7f2EdCCcaC895502E884a8a71",
  "arth.usd": "0x973F054eDBECD287209c36A2651094fA52F99a71",
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
      // uniswap ETH/MAHA
      [eth.weth, eth.ethMahaUniV2LP],
      [eth.maha, eth.ethMahaUniV2LP],

      // sushiswap ETH/MAHA
      [eth.weth, eth.ethMahaSLP],
      [eth.maha, eth.ethMahaSLP],
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
