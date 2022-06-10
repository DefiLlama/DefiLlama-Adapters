const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { getFixBalances } = require("../helper/portedTokens");
const { stakingUnknownPricedLP } = require("../helper/staking");
const BigNumber = require("bignumber.js");

const wkavaAddress = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b";
const rubyTokenAddress = "0xa2c535EBF7A48572F61F9273E8dBF61a0A79610D";
const rshareTokenAddress = "0x5547F680Ad0104273d0c007073B87f98dEF199c6";
const rshareRewardPoolAddress = "0x63c8069EE16BA666800cECaFd99f4C75ad6dd7Aa";
const genesisPoolAddress = "0x0D6f8847EdB9ea4203241529ee753f6b26920f11";
const boardroomAddress = "0x87020747d28255029bA7696Ab9CF46a7a0e3a126";
const treasuryAddress = "0xCA1C89879bE042A6D3b573DB9c7814F75c9DFc19";
const rshareKavaLp = "0x0E5787F2550ddE3D394207aCeFdDe3f0228c7f79";
const rubyKavaLp = "0xa76a3e6b9680339Da182eB81142B7974e16AbF1F";

const Kavalps = [rubyKavaLp, rshareKavaLp];

async function calcPool2(genesisPool, rewardPool, lps, block, chain) {
  let balances = {};

  // calculate genesisPool
  const genesisLpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((p) => ({
        target: p,
        params: genesisPool,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let lpPositions = [];
  genesisLpBalances.forEach((p) => {
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

  // calculate rewardPool
  const lpRewardBalances = (
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
  let lpRewardPositions = [];
  lpRewardBalances.forEach((p) => {
    lpRewardPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });

  await unwrapUniswapLPs(
    balances,
    lpRewardPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );

  // Our RUBY AND RSHARE tokens are not listed in coingecko yet, so calculate correct LP token value by multiplying by 2.
  // LP is standard uniswapV2 50:50 pool. Update after coingecko listing is done.
  balances["kava:0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b"] = BigNumber(balances["kava:0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b"]).times(2).toString();

  // calculate WKAVA single pool
  const wkavaGenesisBalance = (
    await sdk.api.abi.call({
      abi: "erc20:balanceOf",
      chain: chain,
      target: wkavaAddress,
      params: genesisPool,
      block: block,
    })
  ).output;

  await sdk.util.sumSingleBalance(
    balances,
    `kava:${wkavaAddress}`,
    wkavaGenesisBalance
  );
  const wkavaRewardBalance = (
    await sdk.api.abi.call({
      abi: "erc20:balanceOf",
      chain: chain,
      target: wkavaAddress,
      params: rewardPool,
      block: block,
    })
  ).output;

  await sdk.util.sumSingleBalance(
    balances,
    `kava:${wkavaAddress}`,
    wkavaRewardBalance
  );

  (await getFixBalances(chain))(balances);
  return balances;
}

async function KavaPool2(timestamp, block, chainBlocks) {
  return await calcPool2(genesisPoolAddress, rshareRewardPoolAddress, Kavalps, chainBlocks.kava, "kava");
}

module.exports = {
  methodology:
    "Pool2 deposits consist of RUBY/KAVA and RSHARE/KAVA LP and WKAVA tokens deposits while the staking TVL consists of the RSHARE tokens locked within the Boardroom contract.",
  kava: {
    tvl: async () => ({}),
    pool2: KavaPool2,
    staking: stakingUnknownPricedLP(boardroomAddress, rshareTokenAddress, "kava", rshareKavaLp),
  },
};
