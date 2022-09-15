const { gql } = require("graphql-request");

const tvlExclusion = ["optimism"];
const treasuryExclusion = [];
const stakingExclusion = ["optimism"];

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
  },
  optimism: {
    treasury: "0x027F41F041Ed3d484296b9eF7B965d23aBf04200",
    USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
  }
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
