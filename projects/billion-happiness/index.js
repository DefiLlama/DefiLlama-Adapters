const sdk = require("@defillama/sdk");
const { pool2 } = require("../helper/pool2.js");

const bhcToken = "0x6fd7c98458a943f469E1Cf4eA85B173f5Cd342F4";
const masterchef = "0xC5c482a4Ed34b80B861B4e6Eb28664a46bd3eC8B"; //"Feeling Sweet Masterchef"
const pool2LP = "0x851dB01B337Ee3E5Ab161ad04356816F09EA01dc"; // "Feeling Sweet" BHC-WBNB

const stakingPools = [
  "0xa4712bd37cdE563bDfccCfa6DE5E5c2b1Da5572B", // "Feeling Playful"
  "0xE9bFC901644B85161BAFa103ecf4478a87D398E1", // "Feeling Loyal"
  "0xE40525c866Ab074e4103e5d26570Dc61f1729B6d", // "Feeling Stable"
];

async function staking(timestamp, block, chainBlocks) {
  let balances = {};

  let { output: balance } = await sdk.api.abi.multiCall({
    calls: Array.from({ length: stakingPools.length }, (v, k) => ({
      target: bhcToken,
      params: stakingPools[k],
    })),
    abi: "erc20:balanceOf",
    block: chainBlocks.bsc,
    chain: "bsc",
  });

  for (let i = 0; i < balance.length; i++) {
    sdk.util.sumSingleBalance(balances, `bsc:${bhcToken}`, balance[i].output);
  }

  return balances;
}

module.exports = {
  methodology:
    "Pool 2 TVL includes the BHC-WBNB Pancake LP and staking TVL are the BHC tokens staked into the emotion pools",
  bsc: {
    tvl: async () => ({}),
    staking,
    pool2: pool2(masterchef, pool2LP, "bsc", (addr) => `bsc:${addr}`),
  },
  tvl: async () => ({}),
};
