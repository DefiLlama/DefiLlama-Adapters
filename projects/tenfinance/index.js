const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const tenFarmAddress = "0x264A1b3F6db28De4D3dD4eD23Ab31A468B0C1A96";
const tenVault = "0xC2fB710D39f1D116FD3A70789381a3699Ff9fce0";
const tenfi = "0xd15c444f1199ae72795eba15e8c1db44e47abf62";

const replacements = {
  "0xa8bb71facdd46445644c277f9499dd22f6f0a30c":
    "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", //beltBNB -> wbnb
  "0x9cb73f20164e399958261c289eb5f9846f4d1404":
    "bsc:0x55d398326f99059ff775485246999027b3197955", // 4belt -> usdt
  "0x51bd63f240fb13870550423d208452ca87c44444":
    "bsc:0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", //beltBTC->
  "0xaa20e8cb61299df2357561c2ac2e1172bc68bc25":
    "bsc:0x2170ed0880ac9a755fd29b2688956bd959f933f8", //beltETH->
  "0x13ab6739368a4e4abf24695bf52959224367391f":
    "0x25f8087ead173b73d6e8b84329989a8eea16cf73", //YGG
};

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};

  const poolLength = (
    await sdk.api.abi.call({
      target: tenFarmAddress,
      abi: abi["poolLength"],
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  let lps = [];
  let single = [];

  const poolInfos = (
    await sdk.api.abi.multiCall({
      calls: Array.from({ length: Number(poolLength) }, (_, k) => ({
        target: tenFarmAddress,
        params: k,
      })),
      abi: abi["poolInfo"],
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  const lockedTotals = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((p) => ({
        target: p.output.strat,
      })),
      abi: abi["wantLockedTotal"],
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  const symbols = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((p) => ({
        target: p.output.want,
      })),
      abi: "erc20:symbol",
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  const token0Tokens = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((p) => ({
        target: p.output.want,
      })),
      abi: abi["token0"],
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  const token1Tokens = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((p) => ({
        target: p.output.want,
      })),
      abi: abi["token1"],
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  for (let i = 0; i < poolInfos.length; i++) {
    const symbol = symbols[i].output;
    const balance = lockedTotals[i].output;
    const token = poolInfos[i].output.want;
    if(token === "0xFBF4cf9CdD629bF102F68BFEE43A49923f869505") continue;
    if (symbol.endsWith("LP")) {
      const token0 = token0Tokens[i].output.toLowerCase();
      const token1 = token1Tokens[i].output.toLowerCase();
      if (token0 === tenfi || token1 === tenfi) continue;
      lps.push({
        balance,
        token,
      });
    } else {
      if (symbol === "TENFI") continue;
      single.push({
        balance,
        token,
      });
    }
  }

  await unwrapUniswapLPs(balances, lps, chainBlocks.bsc, "bsc", (addr) => {
    if (replacements[addr.toLowerCase()] !== undefined) {
      return replacements[addr.toLowerCase()];
    }
    return `bsc:${addr}`;
  });

  single.forEach((p) => {
    let token = p.token;
    if (replacements[token.toLowerCase()] !== undefined) {
      token = replacements[token.toLowerCase()];
      sdk.util.sumSingleBalance(balances, `${token}`, p.balance);
    } else {
      sdk.util.sumSingleBalance(balances, `bsc:${token}`, p.balance);
    }
  });

  return balances;
}

async function pool2(timestamp, block, chainBlocks) {
  let balances = {};

  const poolLength = (
    await sdk.api.abi.call({
      target: tenFarmAddress,
      abi: abi["poolLength"],
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  let lps = [];

  const poolInfos = (
    await sdk.api.abi.multiCall({
      calls: Array.from({ length: Number(poolLength) }, (_, k) => ({
        target: tenFarmAddress,
        params: k,
      })),
      abi: abi["poolInfo"],
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  const lockedTotals = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((p) => ({
        target: p.output.strat,
      })),
      abi: abi["wantLockedTotal"],
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  const symbols = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((p) => ({
        target: p.output.want,
      })),
      abi: "erc20:symbol",
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  const token0Tokens = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((p) => ({
        target: p.output.want,
      })),
      abi: abi["token0"],
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  const token1Tokens = (
    await sdk.api.abi.multiCall({
      calls: poolInfos.map((p) => ({
        target: p.output.want,
      })),
      abi: abi["token1"],
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  for (let i = 0; i < poolInfos.length; i++) {
    const symbol = symbols[i].output;
    const balance = lockedTotals[i].output;
    const token = poolInfos[i].output.want;
    if(token === "0xFBF4cf9CdD629bF102F68BFEE43A49923f869505") continue;
    if (symbol.endsWith("LP")) {
      const token0 = token0Tokens[i].output;
      const token1 = token1Tokens[i].output;
      if (token0.toLowerCase() === tenfi || token1.toLowerCase() === tenfi) {
        lps.push({
          balance,
          token,
        });
      }
    }
  }

  await unwrapUniswapLPs(balances, lps, chainBlocks.bsc, "bsc", (addr) => {
    if (replacements[addr.toLowerCase()] !== undefined) {
      return replacements[addr.toLowerCase()];
    }
    return `bsc:${addr}`;
  });

  return balances;
}

module.exports = {
  bsc: {
    tvl,
    pool2,
    staking: staking(tenVault, tenfi, "bsc"),
  },
};
