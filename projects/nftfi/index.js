const { sumTokensExport, } = require('../helper/unwrapLPs');

// Vaults
const loan_offer_v2 = "0xf896527c49b44aAb3Cf22aE356Fa3AF8E331F280";
const loan_offer_v2_1 = "0x8252Df1d8b29057d1Afe3062bf5a64D503152BC8";
const loan_offer_v2_2 = "0xd0a40eB7FD94eE97102BA8e9342243A2b2E22207";

const loan_collection_offer_v2_1 = "0xe52cec0e90115abeb3304baa36bc2655731f7934";
const loan_collection_offer_v2_2 = "0xD0C6e59B50C32530C627107F50Acc71958C4341F";

const bundles_v1 = "0x16c583748faed1c5a5bcd744b4892ee6b6290094";
const bundles_v1_1 = "0x0259119359Bf053ebF42C9807752de6bbb4925f3";

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        loan_offer_v2,
        loan_offer_v2_1,
        loan_offer_v2_2,
        loan_collection_offer_v2_1,
        loan_collection_offer_v2_2,
        bundles_v1,
        bundles_v1_1,
      ],
      resolveNFTs: true,
    }),
  },
};
