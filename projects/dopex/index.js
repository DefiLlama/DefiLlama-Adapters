const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { default: BigNumber } = require("bignumber.js");

// ETH Addresses
const dpx = "0xeec2be5c91ae7f8a338e1e5f3b5de49d07afdc81";
const rdpx = "0x0ff5a8451a839f5f0bb3562689d9a44089738d11";

const univ2lps = [
  "0xf64af01a14c31164ff7381cf966df6f2b4cb349f",
  "0x0bf46ba06dc1d33c3bd80ff42497ebff13a88900"
];

const stakingRewards = [
  "0x2A52330Be21D311A7a3f40dAcbFEE8978541B74a",
  "0x175029c85B14C326C83c9f83D4A21Ca339F44Cb5"
];

// Arbitrum Addresses
const arbDpx = "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55";
const arbRdpx = "0x32eb7902d4134bf98a28b963d26de779af92a212";
const dpxStakingRewards = "0xc6D714170fE766691670f12c2b45C1f34405AAb6";
const rdpxStakingRewards = "0x125Cc7CCE81A809c825C945E5aA874E60ccCB6Bb";
 
const slps = [
  "0x0C1Cf6883efA1B496B01f654E247B9b419873054",
  "0x7418F5A2621E13c05d1EFBd71ec922070794b90a"
];

const slpStakingRewards = [
  "0x96B0d9c85415C69F4b2FAC6ee9e9CE37717335B4",
  "0x03ac1Aa1ff470cf376e6b7cD3A3389Ad6D922A74"
];

const ssovs = [
  ["0xbB741dC1A519995eac67Ec1f2bfEecbe5C02f46e", "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55"],
  ["0x6A1142681b74fbeA5dEA07258f573484D80e4435", "0x32eb7902d4134bf98a28b963d26de779af92a212"],
  ["0x2c9C1E9b4BDf6Bf9CB59C77e0e8C0892cE3A9d5f", ADDRESSES.arbitrum.WETH],
  ["0x54552CB564F4675bCEda644e47dE3E35D1c88E1b", "0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1"],
  ["0x5bE3c77ED3Cd42fc2c702C9fcd665f515862B0AE", ADDRESSES.arbitrum.GMX],
];

const crvPools = [
  "0xB73feD58a603Fe6bE5b3403174c9b9598A3272A1",
  "0x9D973C4C04df928F18081e952B407D718D2dAE4E",
  "0xc8067b488A77D84e85AeDBb2dE5d094A5e1c469A",
  "0x4F06645416a38a020CfFaa97cE4DAD04c1Be9906",
  "0x29d5D552bde776abF45C75Fe4fE01A3B59F26798",
  "0x920063B722d4FA90866f2aA3c150d129a10546ff",
  "0xf8Ce3cF6371bDAe43a260445E6dE61575334391c",
  "0x85e1Aa4B34e772153ECB8969d991ceb8F1bC137e"
];

async function ssovTvl(balances, ssov, block, chain) {

  const currentEpochs = (await sdk.api.abi.multiCall({
    calls: ssov.map(p => ({
      target: p[0]
    })),
    abi: abi.currentEpoch,
    block,
    chain
  })).output;

  const totalEpochDeposits = (await sdk.api.abi.multiCall({
    calls: currentEpochs.map(p => ({
      target: p.input.target,
      params: p.output
    })),
    abi: abi.totalEpochDeposits,
    block,
    chain
  })).output;

  for (let i = 0; i < ssov.length; i++) {
    const token = `${chain}:${ssov[i][1]}`;
    const balance = totalEpochDeposits[i].output;
    sdk.util.sumSingleBalance(balances, token, balance);
  }
}

async function crvTvls(balances, crvPools, block, chain) {
  
  const currentEpochs = (await sdk.api.abi.multiCall({
    calls: crvPools.map(p => ({
      target: p
    })),
    abi: abi.currentEpoch,
    block,
    chain
  })).output;

  const totalEpochDeposits = (await sdk.api.abi.multiCall({
    calls: currentEpochs.map(p => ({
      target: p.input.target,
      params: p.output
    })),
    abi: abi.totalEpochDeposits,
    block,
    chain
  })).output;

  const lpPrices = (await sdk.api.abi.call({
    target: crvPools[0],
    abi: abi.getLpPrice,
    block,
    chain
  })).output;

  for (let i = 0; i < crvPools.length; i++) {
    const balance = BigNumber(Number(lpPrices) / 1e18).times(Number(totalEpochDeposits[i].output)).div(1e12).toFixed(0);
    sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.USDT, balance);
  }
}

async function arbTvl(timestamp, block, chainBlocks) {
  let balances = {};

  await ssovTvl(balances, ssovs, chainBlocks.arbitrum, "arbitrum");
  await crvTvls(balances, crvPools, chainBlocks.arbitrum, "arbitrum");
  return balances;
}

// BSC Addresses
const bscSsovs = [
  ["0x818ced3d446292061913f1f74b2eaee6341a76ec", "0xa07c5b74c9b40447a954e1466938b865b6bbea36"]
];

async function bscTvl(timestamp, block, chainBlocks) {
  let balances = {};

  await ssovTvl(balances, bscSsovs, chainBlocks.bsc, "bsc");

  const bnbAmount = (await sdk.api.abi.call({
    target: "0x818ced3d446292061913f1f74b2eaee6341a76ec",
    params: balances["bsc:0xa07c5b74c9b40447a954e1466938b865b6bbea36"],
    abi: abi.vbnbToBnb,
    block: chainBlocks.bsc,
    chain: "bsc" 
  })).output;

  sdk.util.sumSingleBalance(balances, "bsc:" + ADDRESSES.bsc.WBNB, bnbAmount);
  delete balances["bsc:0xa07c5b74c9b40447a954e1466938b865b6bbea36"];

  return balances;
}

// AVAX Addresses
const avaxSsovs = [
  ["0x5540FEa353dF6302611DA1d57988104e43A4B6b6", ADDRESSES.avax.WAVAX]
];

async function avaxTvl(timestamp, block, chainBlocks) {
  let balances = {};

  await ssovTvl(balances, avaxSsovs, chainBlocks.avax, "avax");

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: async () => ({}),
    pool2: staking(stakingRewards, univ2lps)
  },
  arbitrum: {
    tvl: arbTvl,
    pool2: pool2(slpStakingRewards, slps, "arbitrum"),
    staking: staking([dpxStakingRewards, rdpxStakingRewards], [arbRdpx, arbDpx,], 'arbitrum')
  },
  bsc: {
    tvl: bscTvl
  },
  avax:{
    tvl: avaxTvl
  }
}