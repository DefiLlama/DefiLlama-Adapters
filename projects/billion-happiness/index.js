const sdk = require("@defillama/sdk");
const { pool2 } = require("../helper/pool2.js");

const bhcToken = "0x6fd7c98458a943f469E1Cf4eA85B173f5Cd342F4";
const masterchef = "0xC5c482a4Ed34b80B861B4e6Eb28664a46bd3eC8B"; //"Feeling Sweet Masterchef"
const pool2LP = "0x851dB01B337Ee3E5Ab161ad04356816F09EA01dc"; // "Feeling Sweet" BHC-WBNB
const bhcTokenETHW ="0x0c9f28FBdFd79f7C00B805d8c63D053c146d282c";
const BHC_ETHW ="0x899fED261A7df2761CF0b6f7556B80669D135802";
const WETHW ="0x7Bf88d2c0e32dE92CdaF2D43CcDc23e8Edfd5990";

const stakingPools = [
  "0xa4712bd37cdE563bDfccCfa6DE5E5c2b1Da5572B", // "Feeling Playful"
  "0xE9bFC901644B85161BAFa103ecf4478a87D398E1", // "Feeling Loyal"
  "0xE40525c866Ab074e4103e5d26570Dc61f1729B6d", // "Feeling Stable"
];

const ethpowPools =[
"0x28d1F6698c20802B8c38Ae83903046F61e60F529", //Stake BHC earn BHC
  "0xe3891B87204870FC26dE020fc9d92eA9848Df74f", //Stake BHC-ETHW earn BHC
"0x2B7c8977087420E0f29069B4DB74bF35E23FAA8a" //Stake WETHW earn earn BHC
]

const targetCoinsETHW =[
bhcTokenETHW,
  BHC_ETHW,
WETHW
]

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

async function stakingETHW(timestamp, block, chainBlocks) {
  let balances = {};

  let { output: balance } = await sdk.api.abi.multiCall({
    calls: Array.from({ length: ethpowPools.length }, (v, k) => ({
      target: targetCoinsETHW[k],
      params: stakingPools[k],
    })),
    abi: "erc20:balanceOf",
    block: chainBlocks.ethpow,
    chain: "ethpow",
  });

  for (let i = 0; i < balance.length; i++) {
    sdk.util.sumSingleBalance(balances, `ethpow:${targetCoinsETHW[k]}`, balance[i].output);
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
  ethpow:{
    tvl: async () => ({}),
    stakingETHW,
  }
};
