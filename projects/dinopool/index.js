
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { stakingUnknownPricedLP, stakingPricedLP } = require("../helper/staking");

const DINOP = "0x7091002B330D8054cb8584e5057451Ba983b975E";
const sDINO = "0xC21718b8a93529d33E7b5dCdFF439402c47428aC";
const boardroom = "0x2fa7259b002ac24e24f27bc5b83f186e37738b75";
const rewardPool = "0xd04b9FCF5bC9Cd046233f4ead8aDdcD56D2eA453";
const genesisRewardPool = "0xd540Dda886b2F8b0EC31b42038C099d9F1a257B8";

const lps = [
  "0x0526467a2cB9DF86e1FA8f0abA3E4ab090126324",
  "0xFc8281ddAE23612D60A242c10c35EE5E0a4c1541",
];
const genesis = [
    "0x18cD20C6CA9Ccfe1C8b48516e6d5e0055a0271D2",
    "0x0526467a2cB9DF86e1FA8f0abA3E4ab090126324",
    "0x264f27bf0ec4fe383cfda50f1bb11588735bbe6d"
]
const shareLps = "0xFc8281ddAE23612D60A242c10c35EE5E0a4c1541";

async function calcPool2(block, chain) {
    //reward earn sDINO
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((p) => ({
        target: p,
        params: rewardPool,
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
  return await calcPool2(chainBlocks.cronos, "cronos");
}
async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  return balances;
}
module.exports = {
  cronos: {
    tvl: tvl,
    pool2: pool2,
    staking: stakingPricedLP(boardroom, sDINO, "cronos", shareLps, "toxicdeer-finance", null, 18)
  }
}; // node test.js projects/toxicdeer.js
