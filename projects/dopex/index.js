const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { getBlock } = require("../helper/getBlock");
const { pool2s } = require("../helper/pool2");
const { staking } = require("../helper/staking");
const { sumTokensSharedOwners, unwrapCreamTokens } = require("../helper/unwrapLPs");

const DPX = "0xeec2be5c91ae7f8a338e1e5f3b5de49d07afdc81";
const RDPX = "0x0ff5A8451A839f5F0BB3562689D9A44089738D11";
const GOHM = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";
const stakingRewardsDPX = "0xc6D714170fE766691670f12c2b45C1f34405AAb6";
const SSOVDpx = "0x818ceD3D446292061913f1f74B2EAeE6341a76Ec";
const stakingRewardsRDPX = "0x8d481245801907b45823Fb032E6848d0D3c29AE5";
const SSOVRdpx = "0x6607c5e39a43cce1760288Dc33f20eAd51b14D7B";

const arbiDPX = "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55";
const arbiRDPX = "0x32eb7902d4134bf98a28b963d26de779af92a212";
const arbiGOHM = "0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1";

const replacements = {
  [arbiRDPX.toLowerCase()]: RDPX,
  [arbiDPX.toLowerCase()]: DPX,
  [stakingRewardsDPX.toLowerCase()]: DPX,
  [stakingRewardsRDPX.toLowerCase()]: RDPX,
  [arbiGOHM.toLowerCase()]: GOHM,
};

function transformArbitrum(addr) {
  return replacements[addr.toLowerCase()] ?? `arbitrum:${addr}`;
}

const tokensInPools = [
  stakingRewardsDPX,
  stakingRewardsRDPX,
  arbiDPX,
  arbiRDPX,
  arbiGOHM,
];

const ethPools = [
  "0x3154B747C4bFd35C67607d860b884D28F32Ed00F",
  "0x711Da677a0D61Ee855DAd4241B552A706F529C70",
  "0x2c9C1E9b4BDf6Bf9CB59C77e0e8C0892cE3A9d5f"
]
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const pools = [
  //Old pools
  SSOVDpx,
  SSOVRdpx,
  // New pools
  ...ethPools,
  "0x0359B4dcd2412ff0dafa8B020bcb57aA8Bd13A33",
  "0xfE351e85eb6B4292088Dc28B66E9E92aB62fB663",
  "0x48252eDBFCc8A27390827950ccFc1c00152894E3",
  "0xd4cAfE592Be189aeB7826ee5062B29405ee63488",
  "0x460F95323a32e26c8d32346Abe73Eb94d7Db08D6",

  "0xbB741dC1A519995eac67Ec1f2bfEecbe5C02f46e",
  "0x0393352C7C28903e7dEaA5508F01cC89F25BCB5C",
  "0x54552CB564F4675bCEda644e47dE3E35D1c88E1b",
  "0x5bE3c77ED3Cd42fc2c702C9fcd665f515862B0AE",
];

async function arbitrumTvl(timestamp, ethBlock, chainBlocks) {
  const chain = "arbitrum";
  const block = await getBlock(timestamp, chain, chainBlocks);
  const balances = {};
  await sumTokensSharedOwners(
    balances,
    tokensInPools,
    pools,
    block,
    chain,
    transformArbitrum
  );
  for(const ethPool of ethPools){
    const wethInPool = await sdk.api.eth.getBalance({
      target: ethPool,
      block,
      chain,
    });
    sdk.util.sumSingleBalance(balances, weth, wethInPool.output);
  }
  return balances;
}

function nativeTvl(chain, pools, poolToken, token){
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks);
    const balances = {};
    const trans = t=>t===null?token:`${chain}:${t}`
    await unwrapCreamTokens(balances, pools.map(p=>[poolToken, p]), block, chain, trans)
    return balances;
  }
}


module.exports = {
  bsc:{
    tvl: nativeTvl("bsc", [
      "0x818ceD3D446292061913f1f74B2EAeE6341a76Ec"
    ], "0xa07c5b74c9b40447a954e1466938b865b6bbea36", "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c")
  },
  avalanche:{
    tvl: nativeTvl("avax", [
      "0x5540FEa353dF6302611DA1d57988104e43A4B6b6"
    ], "0xc22f01ddc8010ee05574028528614634684ec29e")
  },
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
    staking: sdk.util.sumChainTvls([
      staking(
        stakingRewardsDPX,
        "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55",
        "arbitrum",
        DPX
      ),
      staking(
        stakingRewardsRDPX,
        "0x32Eb7902D4134bf98A28b963D26de779AF92A212",
        "arbitrum",
        RDPX
      ),
    ]),
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
