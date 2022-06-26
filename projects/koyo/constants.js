const { gql } = require("graphql-request");

const addresses = {
  boba: {
    treasury: "0x559dBda9Eb1E02c0235E245D9B175eb8DcC08398",
    staking: "0xD3535a7797F921cbCD275d746A4EFb1fBba0989F",
    KYO: "0x618CC6549ddf12de637d46CDDadaFC0C2951131C",
    BOBA: "0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7",
    FRAX: "0x7562F525106F5d54E891e005867Bf489B5988CD9",
    USDC: "0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc",
    USDT: "0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d",
    DAI: "0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35",
    FRAX_KYO: "0xde7C350fA84B7fe792bfAA241303aeF04283c9d2",
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
  addresses,
  POOL_TOKENS,
};
