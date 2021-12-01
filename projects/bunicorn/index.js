const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const factory = "0x86873f85Bc12ce40321340392C0ff39C3Bdb8D68";

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  let lps = [];
  let poolLength = (
    await sdk.api.abi.call({
      target: factory,
      abi: abi.allPoolsLength,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  let poolInfo = (
    await sdk.api.abi.multiCall({
      calls: Array.from({ length: Number(poolLength) }, (_, k) => ({
        target: factory,
        params: k,
      })),
      abi: abi.allPools,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  let token0 = (
    await sdk.api.abi.multiCall({
      calls: poolInfo.map((p) => ({
        target: p.output,
      })),
      abi: abi.token0,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  let token1 = (
    await sdk.api.abi.multiCall({
      calls: poolInfo.map((p) => ({
        target: p.output,
      })),
      abi: abi.token1,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  let reserves = (
    await sdk.api.abi.multiCall({
      calls: poolInfo.map((p) => ({
        target: p.output,
      })),
      abi: abi.getReserves,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  for (let i = 0; i < reserves.length; i++) {
    sdk.util.sumSingleBalance(
      balances,
      `bsc:${token0[i].output}`,
      reserves[i].output._reserve0
    );
    if (token1[i].output === "0xDDE5B33a56f3F1C22e5a6bd8429E6ad508BFF24E") {
      sdk.util.sumSingleBalance(
        balances,
        "0x1f3f677ecc58f6a1f9e2cf410df4776a8546b5de",
        reserves[i].output._reserve1
      );
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `bsc:${token1[i].output}`,
        reserves[i].output._reserve1
      );
    }
  }

  return balances;
}

module.exports = {
  tvl,
};
