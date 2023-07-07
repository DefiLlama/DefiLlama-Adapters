const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getFixBalances } = require("../helper/portedTokens");
const { getTokenPrices } = require("../helper/unknownTokens")
const { stakingUnknownPricedLP } = require("../helper/staking")

const wkavaAddress = ADDRESSES.kava.WKAVA;
const rshareTokenAddress = "0x5547F680Ad0104273d0c007073B87f98dEF199c6";
const rshareRewardPoolAddress = "0x63c8069EE16BA666800cECaFd99f4C75ad6dd7Aa";
const genesisPoolAddress = "0x0D6f8847EdB9ea4203241529ee753f6b26920f11";
const boardroomAddress = "0x9832941dD0F80086399eC90eC6f6B2676791436a";
const rshareKavaLp = "0x0E5787F2550ddE3D394207aCeFdDe3f0228c7f79";
const rubyKavaLp = "0x41af8e310d639f3b91f640ab6d457c2302326e5c";
const rubyRshareLp = "0x96CB0E7fA38e5FDE6679B55afdfb8678D18f2680";
const rubyUsdcLp = "0x5FF7D68eE6e5f0bbE211B3c0d010160e3cD27Db9";

const Kavalps = [rubyKavaLp, rshareKavaLp, rubyRshareLp, rubyUsdcLp];

async function calcPool2(genesisPool, rewardPool, lps, block, chain) {
  let balances = {};
  const { updateBalances, } = await getTokenPrices({
    block, chain, 
    useDefaultCoreAssets: true, allLps: true, lps,
  })

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

  await updateBalances(balances, { resolveLP: true  });
  (await getFixBalances(chain))(balances);
  return balances;
}

async function calcKava(rewardPool, block, chain) {
  let balances = {};

  const wkavaRewardBalance = (
    await sdk.api.abi.call({
      abi: "erc20:balanceOf",
      chain: chain,
      target: wkavaAddress,
      params: rewardPool,
      block: block,
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    `kava:${wkavaAddress}`,
    wkavaRewardBalance
  );

  (await getFixBalances(chain))(balances);
  return balances;
}

async function KavaSingle(timestamp, block, chainBlocks) {
  return calcKava(rshareRewardPoolAddress, chainBlocks.kava, "kava");
}

async function KavaPool2(timestamp, block, chainBlocks) {
  return calcPool2(genesisPoolAddress, rshareRewardPoolAddress, Kavalps, chainBlocks.kava, "kava");
}

module.exports = {
  hallmarks: [
    [1660521600, "incentives not given"]
  ],
  methodology:
    "Pool2 deposits consist of RUBY/USDC, RUBY/KAVA, RSHARE/KAVA and RUBY/RSHARE LP deposits while the staking TVL consists of the RSHARE tokens locked within the Boardroom contract.",
  kava: {
    tvl: KavaSingle,
    pool2: KavaPool2,
    staking: stakingUnknownPricedLP(boardroomAddress, rshareTokenAddress, "kava", rshareKavaLp),
  },
};