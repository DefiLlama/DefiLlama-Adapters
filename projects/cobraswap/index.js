const { calculateUniTvl } = require("../helper/calculateUniTvl");
const sdk = require("@defillama/sdk");
const { BigNumber } = require("bignumber.js");

const factory = "0x3165d94dd2f71381495cb897832de02710a0dce5";

async function getCobraPrice(block) {
  const chain = "bsc";

  const busdBalance = (await sdk.api.erc20.balanceOf({
    target: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    owner: "0x1011d0abd6fd3965d34a56f7c1789a19fdd9cf67",
    block,
    chain
  })).output;

  const cobraBalance = (await sdk.api.erc20.balanceOf({
    target: "0x2c449ba613873e7b980faf2b686207d7bd205541",
    owner: "0x1011d0abd6fd3965d34a56f7c1789a19fdd9cf67",
    block,
    chain
  })).output;

  return busdBalance/cobraBalance;
}

async function getViperPrice(block) {
  const chain = "bsc";

  const cobraBalance = (await sdk.api.erc20.balanceOf({
    target: "0x2c449ba613873e7b980faf2b686207d7bd205541",
    owner: "0x77a6704a382e5cd8ac74a5994576989d9cede976",
    block,
    chain
  })).output;

  const viperBalance = (await sdk.api.erc20.balanceOf({
    target: "0x7e080699d0f306dbae458b13ea6fa8bfd0efe752",
    owner: "0x77a6704a382e5cd8ac74a5994576989d9cede976",
    block,
    chain
  })).output;

  return cobraBalance/viperBalance;
}

async function tvl(timestamp, block, chainBlocks) {
  let balances = await calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks.bsc, "bsc", factory, 9503477, true);
  const cobraPrice = await getCobraPrice(chainBlocks.bsc);
  const viperPrice = await getViperPrice(chainBlocks.bsc);
  sdk.util.sumSingleBalance(balances, "bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56", BigNumber(balances["bsc:0x2c449ba613873e7b980faf2b686207d7bd205541"]).times(cobraPrice).toFixed(0));
  delete balances["bsc:0x2c449ba613873e7b980faf2b686207d7bd205541"];
  sdk.util.sumSingleBalance(balances, "bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56", BigNumber(balances["bsc:0x7e080699d0f306dbae458b13ea6fa8bfd0efe752"]).times(cobraPrice * viperPrice).toFixed(0));
  delete balances["bsc:0x7e080699d0f306dbae458b13ea6fa8bfd0efe752"];
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Include liquidity in AMM pools`,
  bsc:{
    tvl
  }
}
