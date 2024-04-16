const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const finsFactory = "0xe759Dd4B9f99392Be64f1050a6A8018f73B53a13";

const jaws = "0xdd97ab35e3c0820215bc85a395e13671d84ccba2";
const jawsPool = "0x5D2112Ba0969EC66012380C1fb88F2A3D182Eb90";

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  const allPairsLength = (
    await sdk.api.abi.call({
      target: finsFactory,
      abi: abi.allPairsLength,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  const allPairs = (
    await sdk.api.abi.multiCall({
      calls: Array.from({ length: Number(allPairsLength) }, (_, k) => ({
        target: finsFactory,
        params: k,
      })),
      abi: abi.allPairs,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  const totalSupply = (
    await sdk.api.abi.multiCall({
      calls: allPairs.map((p) => ({
        target: p.output,
      })),
      abi: "erc20:totalSupply",
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  let lpPos = [];
  totalSupply.forEach((p) => {
    if (p.output === "0") return;
    lpPos.push({
      token: p.input.target,
      balance: p.output,
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpPos,
    chainBlocks.bsc,
    "bsc",
    (addr) => `bsc:${addr}`
  );
  return balances;
}

module.exports = {
  methodology: "Liquidity from the finsFactory is counted as TVL",
  bsc: {
    tvl,
    staking: staking(jawsPool, jaws),
  },
};
