const { staking } = require("../helper/staking");
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

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
  "0xEb0F03A203F25F08c7aFF0e1b1C2E0EE25Ca29Eb",
  "0x1f80C96ca521d7247a818A09b0b15C38E3e58a28",
  "0x96B0d9c85415C69F4b2FAC6ee9e9CE37717335B4",
  "0x03ac1Aa1ff470cf376e6b7cD3A3389Ad6D922A74"
];

const ownSsovs = [  
  ["0xbB741dC1A519995eac67Ec1f2bfEecbe5C02f46e", [arbDpx]],
  ["0x05E7ACeD3b7727f9129E6d302B488cd8a1e0C817", [arbDpx]],
  ["0x6A1142681b74fbeA5dEA07258f573484D80e4435", [arbRdpx]],
  ["0xd74c61ca8917Be73377D74A007E6f002c25Efb4e", [arbRdpx]],
  ["0xCdaACF37726Bf1017821b5169e22EB34734B28A8", [arbRdpx]],
].map(i => i[0])

const USDC = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"
const WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
const c2CRV = "0x7f90122bf0700f9e7e1f688fe926940e8839f353"

const config = {
  arbitrum: {
    ssovs: [
      ["0x2c9C1E9b4BDf6Bf9CB59C77e0e8C0892cE3A9d5f", [nullAddress,]],
      ["0xa7507c48d78345475b85bc27B9CE9B84b354CaF7", [c2CRV,]],
      ["0x475a5a712b741b9ab992e6af0b9e5adee3d1851b", ["0x5979D7b546E38E414F7E9822514be443A4800529",]],
      ["0xFca61E79F38a7a82c62f469f55A9df54CB8dF678", ["0x5979D7b546E38E414F7E9822514be443A4800529",]],
      ["0x32449DF9c617C59f576dfC461D03f261F617aD5a", [c2CRV,]],
      ["0xf71b2B6fE3c1d94863e751d6B455f750E714163C", [c2CRV,]],
      ["0xb4ec6B4eC9e42A42B0b8cdD3D6df8867546Cf11d", [c2CRV,]],
      ["0xf071F0c56543A2671a2Dfc5FF51d5d858Be91514", [c2CRV,]],
      ["0x7C5aC7E4E352B733CF65721d9Fe28A17Da890159", [c2CRV,]],
      ["0xC59836FEC63Cfb2E48b0aa00515056436D74Dc03", [WETH,]],
      ["0x10FD85ec522C245a63239b9FC64434F58520bd1f", ["0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55",]],
      ["0x4269AF9076586230bF5fa3655144a5fe9CB877Fd", [c2CRV,]],
      ["0x546cd36F761f1D984eEE1Dbe67cC4F86E75cAF0C", ["0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1",]],

      ["0x54552CB564F4675bCEda644e47dE3E35D1c88E1b", ["0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1",]],
      ["0x5bE3c77ED3Cd42fc2c702C9fcd665f515862B0AE", ["0xf42ae1d54fd613c9bb14810b0588faaa09a426ca", "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a", WETH,]],
    ],
    stradles: [
      ["0xfca313e2be55957AC628a6193A60D38aDC2da64E", [USDC, WETH]],
      ["0x5847a350a388454a76f34Ceb6eb386Bf652DD0DD", [USDC]],
      ["0x0Dc96f38980144ebFfe745706DFeE92622dba829", [USDC]],
    ],
    atlantisPuts: [
      ["0x9C6b9Bd786adB1f644cedbDcB193203cbC90D1AF", [USDC]],
      // ["", [""]],
    ]
  },
  bsc: {
    ssovs: [
      ["0x818ced3d446292061913f1f74b2eaee6341a76ec", ["0xa07c5b74c9b40447a954e1466938b865b6bbea36",]]
    ],
  },
  polygon: {
    ssovs: [
      ["0x4Ee9fe9500E7C4Fe849AdD9b14beEc5eC5b7d955", ["0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4", '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270']]
    ],
    stradles: [
      ["0x1a848bc8C28b4ea08C2f1589386C4f988d4e9fcb", ["0x2791bca1f2de4661ed88a30c99a7a9449aa84174"]],
    ],
  },
  avax: {
    ssovs: [
      ["0x5540FEa353dF6302611DA1d57988104e43A4B6b6", [nullAddress,]],
    ],
  },
}


async function ssovTvl(api) {
  const { ssovs, stradles, atlantisPuts, } = config[api.chain]
  const ownerTokens = ssovs.map(([v, t]) => [t, v])
  if (stradles) stradles.forEach(([v, t]) => ownerTokens.push([t, v]))
  if (atlantisPuts) atlantisPuts.forEach(([v, t]) => ownerTokens.push([t, v]))
  return sumTokens2({ api, ownerTokens })
}

async function tvl(timestamp, block, chainBlocks, { api }) {
  return ssovTvl(api)
}


module.exports = {
  ethereum: {
    tvl: async () => ({}),
    pool2: staking(stakingRewards, univ2lps)
  },
  arbitrum: {
    tvl,
    pool2: staking(slpStakingRewards, slps),
    staking: staking([dpxStakingRewards, rdpxStakingRewards, '0x80789d252a288e93b01d82373d767d71a75d9f16', ...ownSsovs, ], [arbRdpx, arbDpx,])
  },
  bsc: { tvl, },
  avax: { tvl, },
  polygon: { tvl, },
}