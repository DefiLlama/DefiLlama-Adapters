const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs, nullAddress } = require("../helper/unwrapLPs");

const spr = "0x8c739564345dfcb7e4c7e520b0e8fa142c358a78";
const mastermind = "0x0Ff4c81489fbaFf02201b55636Df5889b43972e9";

async function calcTvl(block, spr, mastermind, pool2, api) {
  const balances = {}
  const poolInfos = (await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: mastermind })).filter(i => i.target !== nullAddress)

  const tokens = (await api.multiCall({
    calls: poolInfos.map(p => ({
      target: p.target,
      params: p.targetPoolId
    })),
    abi: abi["lockableToken"],
  }))

  const symbols = (await api.multiCall({
    calls: tokens,
    abi: "erc20:symbol",
  }));

  const lps = [];

  for (let i = 0; i < poolInfos.length; i++) {
    if (tokens[i] === null) continue;
    const token = tokens[i].toLowerCase();
    const symbol = symbols[i];
    const balance = poolInfos[i].totalDeposits;
    if (token === spr) continue;
    if (!symbol.endsWith("LP") && pool2) continue;
    if (symbol.endsWith("LP")) {
      lps.push([token, balance]);
    } else {
      sdk.util.sumSingleBalance(balances, `fantom:${token}`, balance);
    }
  }

  const lpToken0 = (await api.multiCall({
    calls: lps.map(p => ({
      target: p[0]
    })),
    abi: abi["token0"],
  }));

  const lpToken1 = (await api.multiCall({
    calls: lps.map(p => ({
      target: p[0]
    })),
    abi: abi["token1"],
  }));

  let lpPositions = [];
  for (let i = 0; i < lps.length; i++) {
    const token = lps[i][0].toLowerCase();
    const token0 = lpToken0[i].toLowerCase();
    const token1 = lpToken1[i].toLowerCase();
    if (pool2) {
      if (token0 !== spr && token1 !== spr) continue;
      lpPositions.push({
        token,
        balance: lps[i][1]
      });
    } else {
      if (token0 === spr || token1 === spr) continue;
      lpPositions.push({
        token,
        balance: lps[i][1]
      });
    }
  }

  await unwrapUniswapLPs(balances, lpPositions, api.block, api.chain, addr => `fantom:${addr}`);

  return balances;
}

async function tvl(api) {
  return await calcTvl(api.block, spr, mastermind, false, api);
}

async function pool2(api) {
  return await calcTvl(api.block, spr, mastermind, true, api);
}

module.exports = {
  fantom: {
    tvl,
    pool2
  }
}
