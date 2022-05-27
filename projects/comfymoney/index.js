const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { fixHarmonyBalances } = require("../helper/portedTokens");
const { getBlock } = require("../helper/getBlock");

const comfyTokenAddress = "0x702f78E81Cf3DfaE89648b5a9e2e1aa8db1De546";
const cshareTokenAddress = "0x3CB98cacd44Ee77eb35E99EB74Ace91bF550c964";
const comfyRewardPoolAddress = "0x893F07c9E10932349b01Db7A3833Fe756C2D59A8";
const cshareRewardPoolAddress = "0x53efc025d19270b899eBf89DD89a1F58CE1CD66f";
const zenDenAddress = "0x108426718E67da46e09E841bC4e8430A824BDaFc";
const treasuryAddress = "0xb44570F6b0C2B892BcB9d3620C820A10011abbFf";

const comfyWoneLp = "0xF2d9E493a280545699E3C07aEe22eaE9EF24DDb7";
const cshareWoneLp = "0x8fd44A4fB89e26A97B0eDf99535236D415D03E50";

const allLpPools = [
  { poolAddress: comfyRewardPoolAddress, tokenAddress: comfyWoneLp },
  { poolAddress: cshareRewardPoolAddress, tokenAddress: cshareWoneLp },
  { poolAddress: cshareRewardPoolAddress, tokenAddress: comfyWoneLp },
];

const callParams = allLpPools.map((pool) => {
  return { target: pool.tokenAddress, params: pool.poolAddress };
});

async function calcPool2(block, chain) {
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: callParams,
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
  fixHarmonyBalances(balances);
  return balances;
}

async function onePool2(timestamp, block, chainBlocks) {
  return await calcPool2(chainBlocks.harmony, "harmony");
}

async function treasury(timestamp, block, chainBlocks) {
  const _block = await getBlock(timestamp, "harmony", chainBlocks, true);
  let balance = (
    await sdk.api.erc20.balanceOf({
      target: comfyTokenAddress,
      owner: treasuryAddress,
      block: _block,
      chain: "harmony",
    })
  ).output;

  return { [`harmony:${comfyTokenAddress}`]: balance };
}
module.exports = {
  methodology:
    "Pool2 deposits consist of COMFY/ONE and CSHARE/ONE LP tokens deposited in the MasterChef based contracts, whilst the staking TVL consists of the CSHARE tokens locked within the Zen Den contract(0x108426718E67da46e09E841bC4e8430A824BDaFc).",
  harmony: {
    tvl: async () => ({}),
    pool2: onePool2,
    staking: staking(zenDenAddress, cshareTokenAddress, "harmony"),
    treasury,
  },
};
