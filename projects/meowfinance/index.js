const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { pool2Exports } = require("../helper/pool2");
const { stakingUnknownPricedLP } = require("../helper/staking");

const meow = "0x41F4CC9613E31d4E77C428b40D53537Da24264Ee";
const meowMining = "0xba1a3dACa919616aA462E93A80EFbe82753f9087";
const meowFtm = "0x150Aeb5389d56E258c2bbb42c7e67e944EDEE913";
const treasuryContract = "0x7d25f49C648B2a12B5f530Df929204352cb6080e";

const translate = {
  "0x049d68029688eabf473097a2fc38ef61633a3c7a":
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e":
    "0x6b175474e89094c44da98b954eedeac495271d0f",
};

async function calcTvl(block, chain, borrow) {
  let balances = {};
  const poolLength = (
    await sdk.api.abi.call({
      target: meowMining,
      abi: abi.poolLength,
      block,
      chain,
    })
  ).output;
  const poolInfo = (
    await sdk.api.abi.multiCall({
      calls: Array.from({ length: Number(poolLength) }, (_, k) => ({
        target: meowMining,
        params: k,
      })),
      abi: abi.poolInfo,
      block,
      chain,
    })
  ).output;
  const symbols = (
    await sdk.api.abi.multiCall({
      calls: poolInfo.map((p) => ({
        target: p.output.stakeToken,
      })),
      abi: "erc20:symbol",
      block,
      chain,
    })
  ).output;
  let ibTokens = [];
  symbols.forEach((p) => {
    if (p.output.startsWith("ib")) {
      ibTokens.push(p.input.target);
    }
  });
  const underlyingtoken = (
    await sdk.api.abi.multiCall({
      calls: ibTokens.map((p) => ({
        target: p,
      })),
      abi: abi.token,
      block,
      chain,
    })
  ).output;
  const totalToken = (
    await sdk.api.abi.multiCall({
      calls: ibTokens.map((p) => ({
        target: p,
      })),
      abi: abi.totalToken,
      block,
      chain,
    })
  ).output;
  const vaultDebtVal = (
    await sdk.api.abi.multiCall({
      calls: ibTokens.map((p) => ({
        target: p,
      })),
      abi: abi.vaultDebtVal,
      block,
      chain,
    })
  ).output;
  for (let i = 0; i < ibTokens.length; i++) {
    let token = underlyingtoken[i].output.toLowerCase();
    let total = Number(totalToken[i].output);
    let debt = Number(vaultDebtVal[i].output);
    if (translate[token] !== undefined) {
      token = translate[token];
    } else {
      token = `fantom:${token}`;
    }
    if (!borrow) {
      sdk.util.sumSingleBalance(balances, token, total - debt);
    } else {
      sdk.util.sumSingleBalance(balances, token, debt);
    }
  }
  return balances;
}

async function tvl(timestamp, block, chainBlocks) {
  return await calcTvl(chainBlocks.fantom, "fantom", false);
}

async function borrowed(timestamp, block, chainBlocks) {
  return await calcTvl(chainBlocks.fantom, "fantom", true);
}

module.exports = {
  fantom: {
    tvl,
    borrowed,
    pool2: pool2Exports(
      meowMining,
      [meowFtm],
      "fantom",
      (addr) => `fantom:${addr}`
    ),
    staking: stakingUnknownPricedLP(
      meowMining,
      meow,
      "fantom",
      meowFtm,
      (addr) => `fantom:${addr}`
    ),
    treasury: stakingUnknownPricedLP(
      treasuryContract,
      meow,
      "fantom",
      meowFtm,
      (addr) => `fantom:${addr}`
    ),
  },
};
