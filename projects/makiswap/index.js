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
      if (addr === "0x5ee41ab6edd38cdfb9f6b4e6cf7f75c87e170d98") {
        return "0x0000000000085d4780b73119b644ae5ecd22b376";
      } else if (addr === "0x343ca8e4e6bbb400251525c3c12a7274e49056fc") {
        return "0x5fa2e9ba5757504b3d6e8f6da03cc40d4ce19499";
      } else if (addr === "0x40280e26a572745b1152a54d1d44f365daa51618") {
        return "bsc:0xba2ae424d960c26247dd6c32edc70b295c744c43";
      } else if (addr === "0x4a31d1ad7430586752a1888fe947e3e7d52affb8") {
        return "0xed04915c23f00a313a544955524eb7dbd823143d";
      } else if (addr === "0x461d52769884ca6235b685ef2040f47d30c94eb5") {
        return "bsc:0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3";
      } else if (addr === "0x27d4dfdb3fdf58e198ba4dbc23b2f82c0b8e3405") {
        return "bsc:0x154a9f9cbd3449ad22fdae23044319d6ef2a1fab";
      } else if (addr === "0x843af718ef25708765a8e0942f89edeae1d88df0") {
        return "bsc:0x3ee2200efb3400fabb9aacf31297cbdd1d435d47";
      } else if (addr === "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c") {
        return "0x0ff6ffcfda92c53f615a4a75d982f399c989366b";
      } else if (addr === "0xdb11743fe8b129b49b11236e8a715004bdabe7e5") {
        return "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0";
      } else if (addr === "0xdd86dd2dc0aca2a8f41a680fc1f88ec1b7fc9b09") {
        return "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce";
      } else if (addr === "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c") {
        return "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c";
      } else if (addr === "0xce0a5ca134fb59402b723412994b30e02f083842") {
        return "0xc00e94cb662c3520282e6f5717214004a7f26888";
      } else if (addr === "0x3d760a45d0887dfd89a2f5385a236b29cb46ed2a") {
        return "0x6b175474e89094c44da98b954eedeac495271d0f";
      } else if (addr === "0x9362bbef4b8313a8aa9f0c9808b80577aa26b73b") {
        return "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
      } else if (addr === "0x62c10412d69823a98db5c09cf6e82810e0df5ad7") {
        return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
      } else if (addr === "0xc8f62c36e2b92fe60e68c14eb783293dc5bf2ae0") {
        return "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
      }
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
  tvl,
};
