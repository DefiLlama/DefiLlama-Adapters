const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2Exports } = require("../helper/pool2");
const {BigNumber} = require("bignumber.js");

const ethStn = "0xe63d6b308bce0f6193aec6b7e6eba005f41e36ab";
const ethStnVault = "0xa72ad1293b253522fde41f1104aa432d7669b299";
const ethStaking = "0xbc96510af0f9dd7bae8deb6ac3daed2f18cf5757";

const ethUniVault = "0xafb6c80ff3cfdae5977df0196f3d35cd65e3c7a3";
const ethStnWeth = "0x00d76633a1071e9aed6158ae1a5e1c4c5dc75e54";

const polyStn = "0xfb8a07e99450d1dc566da18a8f0e630addefdd3e";
const polyStnVault = "0xa035ecd4824c4c13506d39d7041e8e0ad156686d";
const polyStaking = "0x5fd6daeda01e83cec78b3696d581791f24d7eab4";

const polyUniVault = "0x6ec3bcbb751fe3308dde173c9c91bf9ea9ac7163";
const polyUsdtStn = "0x2ee7b1ddd28514d49d3bfe0bedef52ffa86d7a8b";

const bscStn = "0xf7fb08c187e6cd1f2149e6c818d0b6d4d4ef1430";
const bscStnVault = "0xbd2861c0f43f6e8d571fcfa5a7c77d13d5695ebf";
const bscStaking = "0x76c43dff5adeea308eb3c47a735c91cddf857069";
const bscBusdStn = "0x1f0af1934a4133e27469ec93a9840be99d127577";

const stBnb = "0xd523a3c371c0c301794120c7ca9639f22c02839a";
const cakeVault = "0xd478963bc6db450d35739b96b1542240eb606267";
const bscstBnbWBnb = "0x002e1655e05bd214d1e517b549e2a80bda31d2e5";
const stonebank = "0x63598a507B5901721097B1f1407d2Ba89D49b3d4";

const ignoreTokens = [ethStnWeth, polyUsdtStn, bscBusdStn, bscstBnbWBnb, stBnb];

async function tvlFromStaking(stakingContract, stn, block, chain) {
  let balances = {};

  const poolLength = (
    await sdk.api.abi.call({
      target: stakingContract,
      abi: abi.poolLength,
      block,
      chain,
    })
  ).output;

  const poolInfo = (
    await sdk.api.abi.multiCall({
      calls: Array.from({ length: Number(poolLength) }, (_, k) => ({
        target: stakingContract,
        params: k,
      })),
      abi: abi.poolInfo,
      block,
      chain,
    })
  ).output;

  const underlying = (
    await sdk.api.abi.multiCall({
      calls: poolInfo.map((p) => ({
        target: p.output.lpToken,
      })),
      abi: abi.token,
      block,
      chain,
    })
  ).output;

  const totalAssets = (
    await sdk.api.abi.multiCall({
      calls: poolInfo.map((p) => ({
        target: p.output.lpToken,
      })),
      abi: abi.totalAssets,
      block,
      chain,
    })
  ).output;

  for (let i = 0; i < Number(poolLength); i++) {
    let token = underlying[i].output.toLowerCase();
    let balance = totalAssets[i].output;
    if (token === stn || ignoreTokens.includes(token)) continue;
    if (token === "0xd523a3c371c0c301794120c7ca9639f22c02839a") {
      token = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    }
    sdk.util.sumSingleBalance(balances, `${chain}:${token}`, balance);
  }
  return balances;
}

async function ethTvl(timestamp, block) {
  return await tvlFromStaking(ethStaking, ethStn, block, "ethereum");
}

async function polyTvl(timestamp, block, chainBlocks) {
  return await tvlFromStaking(
    polyStaking,
    polyStn,
    chainBlocks.polygon,
    "polygon"
  );
}

async function bscTvl(timestamp, block, chainBlocks) {
  let balances =  await tvlFromStaking(bscStaking, bscStn, chainBlocks.bsc, "bsc");
  const bnbStakeBalance = (await sdk.api.abi.call({
    target: stonebank,
    abi: abi.stbnbMarketCapacityCountByBNB,
    block: chainBlocks.bsc, 
    chain: "bsc"
  })).output;
  sdk.util.sumSingleBalance(balances, ["binancecoin"], BigNumber(bnbStakeBalance).div(10 ** 18).toFixed(0));
  return balances
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking: staking(ethStnVault, ethStn),
    pool2: pool2Exports(ethUniVault, [ethStnWeth]),
  },
  polygon: {
    tvl: polyTvl,
    staking: staking(polyStnVault, polyStn, "polygon", (addr = ethStn)),
    pool2: pool2Exports(
      polyUniVault,
      [polyUsdtStn],
      "polygon",
      (addr => ethStn)
    ),
  },
  bsc: {
    tvl: bscTvl,
    staking: staking(bscStnVault, bscStn, "bsc", (addr = ethStn)),
  },
};
