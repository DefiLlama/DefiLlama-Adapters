const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const abi = require("./abi.json");

const factory = "0x11cdC9Bd86fF68b6A6152037342bAe0c3a717f56";
const maki = "0x5FaD6fBBA4BbA686bA9B8052Cf0bd51699f38B93";
const makiChef = "0x4cb4c9C8cC67B171Ce86eB947cf558AFDBcAB17E";

const ignoreLPs = [
  "0x329bae377d60df25e58a17b3d0b1d46cf2f4fd8b",
  "0x4db7c033137c2843481a686cc0cb415ad09fa764",
  "0x5e9cdc40d1acf45fef65313142e40c72059bcb98",
];

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  let poolLength = (
    await sdk.api.abi.call({
      target: factory,
      abi: abi.totalPairs,
      block: chainBlocks.heco,
      chain: "heco",
    })
  ).output;
  let allPools = (
    await sdk.api.abi.multiCall({
      calls: Array.from({ length: Number(poolLength) }, (_, k) => ({
        target: factory,
        params: k,
      })),
      abi: abi.allPairs,
      block: chainBlocks.heco,
      chain: "heco",
    })
  ).output;
  let supply = (
    await sdk.api.abi.multiCall({
      calls: allPools.map((p) => ({
        target: p.output,
      })),
      abi: "erc20:totalSupply",
      block: chainBlocks.heco,
      chain: "heco",
    })
  ).output;
  let ignoreLPSupply = (
    await sdk.api.abi.multiCall({
      calls: ignoreLPs.map((p) => ({
        target: p,
      })),
      abi: "erc20:totalSupply",
      block: chainBlocks.heco,
      chain: "heco",
    })
  ).output;
  let lpPositions = [];
  supply.forEach((p) => {
    let addr = p.output.toLowerCase();
    if (addr === "0") {
      return;
    }
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });
  ignoreLPSupply.forEach((p) => {
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks.heco,
    "heco",
    (addr) => {
      return `heco:${addr}`;
    },
    ignoreLPs
  );
  return balances;
}

async function staking(timestamp, block, chainBlocks) {
  let balances = {};
  let balance = (
    await sdk.api.erc20.balanceOf({
      target: maki,
      owner: makiChef,
      block: chainBlocks.heco,
      chain: "heco",
    })
  ).output;
  sdk.util.sumSingleBalance(balances, `heco:${maki}`, balance);
  return balances;
}

module.exports = {
  methodology: "TVL consists of LPs created by the factory contract",
  heco: {
    tvl,
    staking,
  },
};
