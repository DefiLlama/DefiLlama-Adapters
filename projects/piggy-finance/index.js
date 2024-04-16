const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const piggy = "0x1a877B68bdA77d78EEa607443CcDE667B31B0CdF";
const pshare = "0xa5e2cfe48fe8c4abd682ca2b10fcaafe34b8774c";
const rewardPool = "0xA880Ab40395A6C00f0bf4c105bB7eAA06A8a1B62";
const pshareStaking = "0x4cCc31bfd4b32BFcb9bF148f44FB9CfE75c379AB";

const AvaxLPs = [
  "0x2440885843d8e9f16a4b64933354d1CfBCf7F180", // PIGGY-WAVAX
  "0x40128a19F97cb09f13cc370909fC82E69Bccabb1", // PSHARE-WAVAX
];

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

async function AvaxPool2(timestamp, block, chainBlocks) {
  return await calcPool2(rewardPool, AvaxLPs, chainBlocks.avax);
}

module.exports = {
  methodology: "Pool2 deposits consist of PIGGY-WAVAX and PSHARE-WAVAX LP tokens deposits while the staking TVL consists of the PSHARES tokens locked within the staking contract(0x4cCc31bfd4b32BFcb9bF148f44FB9CfE75c379AB).",
  avax: {
    tvl: async () => ({}),
    pool2: AvaxPool2,
    staking: staking(pshareStaking, pshare),
  },
};


module.exports.deadFrom = '2023-04-09'