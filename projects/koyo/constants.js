const { gql } = require("graphql-request");

const tvlExclusion = ["arbitrum", "avax", "bsc"];
const treasuryExclusion = [];
const stakingExclusion = ["arbitrum", "avax", "bsc", "aurora"];

const addresses = {
  boba: {
    treasury: "0x559dBda9Eb1E02c0235E245D9B175eb8DcC08398",
    staking: "0xD3535a7797F921cbCD275d746A4EFb1fBba0989F",
    feeCollector: "0xc9453BaBf4705F18e3Bb8790bdc9789Aaf17c2E1",
    KYO: "0x618CC6549ddf12de637d46CDDadaFC0C2951131C",
    BOBA: "0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7",
    FRAX: "0x7562F525106F5d54E891e005867Bf489B5988CD9",
    USDC: "0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc",
    USDT: "0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d",
    DAI: "0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35",
    FRAX_KYO: "0xde7C350fA84B7fe792bfAA241303aeF04283c9d2",
  },
  arbitrum: {
    treasury: "0x7736DdFbf43eF2c4751F1E1D8f93EE15a5387DD9",
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
  },
  avax: {
    treasury: "0x898125D67b9c8aD1029E42A2B16EF4CbB08c330f",
    USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  },
  bsc: {
    treasury: "0x0F22D4765f66f2f8a9EF4Cd5D8F75B49933cF1CA",
    BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  },
  aurora: {
    treasury: "0x0D9f7E01a3b8D35e56e3373AfD331340fFe9D7AF",
    feeCollector: "0x67900C87C756763F404926e188c21Eef959c7E06",
  },
};

const POOL_TOKENS = gql`
  {
    koyos {
      address
      pools(first: 1000) {
        tokens {
          address
        }
      }
    }
  }
`;

module.exports = {
  tvlExclusion,
  treasuryExclusion,
  stakingExclusion,
  addresses,
  POOL_TOKENS,
};
