
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { stakingUnknownPricedLP, stakingPricedLP } = require("../helper/staking");

const DEER = "0x8efbaa6080412d7832025b03b9239d0be1e2aa3b";
const XDSHARE = "0x6f715158d4b1468528da002f5941c72fe4159520";
const boardroom = "0x85b60750761d0e170237700Ce1e94213E1742A34";
const rewardPool = "0xf6c3e1B489c1e634a3c66876d5A8E19B1A65B252";
const lps = [
  "0x264f27bf0ec4fe383cfda50f1bb11588735bbe6d",
  "0x18cD20C6CA9Ccfe1C8b48516e6d5e0055a0271D2",
  "0x40d85d01f8b8E4A8cEa6F552e47Cf8F88A42db54"
];
const shareLps = "0x18cD20C6CA9Ccfe1C8b48516e6d5e0055a0271D2";

async function calcPool2(masterchef, lps, block, chain) {
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((p) => ({
        target: p,
        params: masterchef,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let lpPositions = [];
  lpBalances.forEach((p) => {
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );
  return balances;
}

async function pool2(timestamp, block, chainBlocks) {
  return await calcPool2(rewardPool, lps, chainBlocks.cronos, "cronos");
}
async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  return balances;
}
module.exports = {
  cronos: {
    tvl: tvl,
    pool2: pool2,
    staking: stakingPricedLP(boardroom, XDSHARE, "cronos", shareLps, "usd-coin", null, 6)
  }
}; // node test.js projects/toxicdeer.js
