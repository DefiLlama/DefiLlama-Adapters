const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const abi = require("./abi");
const { pool2s } = require("../helper/pool2");
const { staking } = require("../helper/staking");

const DPX = "0xeec2be5c91ae7f8a338e1e5f3b5de49d07afdc81";
const RDPX = "0x0ff5A8451A839f5F0BB3562689D9A44089738D11";
const stakingRewardsDPX = "0xc6D714170fE766691670f12c2b45C1f34405AAb6";
const SSOVDpx = "0x818ceD3D446292061913f1f74B2EAeE6341a76Ec";
const stakingRewardsRDPX = "0x8d481245801907b45823Fb032E6848d0D3c29AE5";
const SSOVRdpx = "0x6607c5e39a43cce1760288Dc33f20eAd51b14D7B";

function transformArbitrum(addr) {
  if (addr.toLowerCase() === "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55") {
    return DPX;
  } else if (
    addr.toLowerCase() === "0x32eb7902d4134bf98a28b963d26de779af92a212"
  ) {
    return RDPX;
  }
  return `arbitrum:${addr}`;
}

async function arbitrumTvl(timestamp, block) {
  let balances = {};
  const ssovBalance = await sdk.api.abi.call({
    target: stakingRewardsDPX,
    abi: abi["balanceOf"],
    params: [SSOVDpx],
    block: block,
    chain: "arbitrum",
  });
  const ssovDpxBalance = await sdk.api.abi.call({
    target: "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55",
    abi: "erc20:balanceOf",
    params: [SSOVDpx],
    block: block,
    chain: "arbitrum",
  });
  const ssovEarntRewards = await sdk.api.abi.call({
    target: stakingRewardsDPX,
    abi: abi["earned"],
    params: [SSOVDpx],
    block: block,
    chain: "arbitrum",
  });
  const ssovRdpxBalance = await sdk.api.abi.call({
    target: "0x32eb7902d4134bf98a28b963d26de779af92a212",
    abi: "erc20:balanceOf",
    params: [SSOVDpx],
    block: block,
    chain: "arbitrum",
  });

  balances[DPX] = new BigNumber(ssovBalance.output)
    .plus(new BigNumber(ssovEarntRewards.output.DPXtokensEarned))
    .plus(new BigNumber(ssovDpxBalance.output))
    .toFixed();
  balances[RDPX] = new BigNumber(ssovEarntRewards.output.RDPXtokensEarned)
    .plus(new BigNumber(ssovRdpxBalance.output))
    .toFixed();

  const ssovRDPXBalance = await sdk.api.abi.call({
    target: stakingRewardsRDPX,
    abi: abi["balanceOf"],
    params: [SSOVRdpx],
    block: block,
    chain: "arbitrum",
  });
  const ssovRDPXDpxBalance = await sdk.api.abi.call({
    target: "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55",
    abi: "erc20:balanceOf",
    params: [SSOVRdpx],
    block: block,
    chain: "arbitrum",
  });
  const ssovRDPXEarntRewards = await sdk.api.abi.call({
    target: stakingRewardsRDPX,
    abi: abi["earned"],
    params: [SSOVRdpx],
    block: block,
    chain: "arbitrum",
  });
  const ssovRDPXRdpxBalance = await sdk.api.abi.call({
    target: "0x32eb7902d4134bf98a28b963d26de779af92a212",
    abi: "erc20:balanceOf",
    params: [SSOVRdpx],
    block: block,
    chain: "arbitrum",
  });

  balances[DPX] = new BigNumber(balances[DPX])
    .plus(new BigNumber(ssovRDPXEarntRewards.output.DPXtokensEarned))
    .plus(new BigNumber(ssovRDPXDpxBalance.output))
    .toFixed();
  balances[RDPX] = new BigNumber(balances[RDPX])
    .plus(new BigNumber(ssovRDPXBalance.output))
    .plus(new BigNumber(ssovRDPXEarntRewards.output.RDPXtokensEarned))
    .plus(new BigNumber(ssovRDPXRdpxBalance.output))
    .toFixed();

  return balances;
}

async function dopexStakings(timestamp, _ethBlock, chainBlocks) {
  const stakingDpx = await staking(
    stakingRewardsDPX,
    "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55",
    "arbitrum",
    DPX
  )(timestamp, _ethBlock, chainBlocks);
  const stakingRdpx = await staking(
    stakingRewardsRDPX,
    "0x32Eb7902D4134bf98A28b963D26de779AF92A212",
    "arbitrum",
    RDPX
  )(timestamp, _ethBlock, chainBlocks);
  return { ...stakingDpx, ...stakingRdpx };
}

module.exports = {
  ethereum: {
    staking: staking(
      "0xce4d3e893f060cb14b550b3e6b0ad512bef30995",
      DPX,
      "ethereum"
    ),
    pool2: pool2s(
      [
        "0x2a52330be21d311a7a3f40dacbfee8978541b74a",
        "0x175029c85b14c326c83c9f83d4a21ca339f44cb5",
      ],
      [
        "0xf64af01a14c31164ff7381cf966df6f2b4cb349f",
        "0x0bf46ba06dc1d33c3bd80ff42497ebff13a88900",
      ],
      "ethereum"
    ),
    tvl: async () => ({}),
  },
  arbitrum: {
    staking: dopexStakings,
    pool2: pool2s(
      [
        "0x96B0d9c85415C69F4b2FAC6ee9e9CE37717335B4",
        "0x03ac1Aa1ff470cf376e6b7cD3A3389Ad6D922A74",
      ],
      [
        "0x0C1Cf6883efA1B496B01f654E247B9b419873054",
        "0x7418F5A2621E13c05d1EFBd71ec922070794b90a",
      ],
      "arbitrum",
      transformArbitrum
    ),
    tvl: arbitrumTvl,
  },
};
