const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");
const { sumTokensExport } = require("../helper/sumTokens");

const owners = [
  "bc1pylrcm2ym9spaszyrwzhhzc2qf8c3xq65jgmd8udqtd5q73a2fulsztxqyy",
  "bc1qh604n2zey83dnlwt4p0m8j4rvetyersm0p6fts",
  "31wQsi1uV8h7mL3QvBXQ3gzkH9zXNTp5cF",
  "bc1q9hs56nskqsxmgend4w0823lmef33sux6p8rzlp",
  "32jbimS6dwSEebMb5RyjGxcmRoZEC5rFrS",
  "bc1qlhkfxlzzzcc25z95v7c0v7svlp5exegxn0tf58",
  "3MJ8mbu4sNseNeCprG85emwgG9G9SCort7",
  "bc1qeph95q50cq6y66elk3zzp48s9eg66g47cptpft",
  "bc1qfcwjrdjk3agmg50n4c7t4ew2kjqqxc09qgvu7d",
  "1882c4wfo2CzNo4Y4LCqxKGQvz7BsE7nqJ",
  "1KGnLjKyqiGSdTNH9s6okFk2t5J7R6CdWt",
  "bc1qt2kjf5guf4dvv4mvnswyk8ksaeuh5xyhc5gz64",
  "19GTEWTnVgenpDWSdQEAT9LJqMFQ7Yogsu",
  "bc1qxmwuugmcnn5k3hz22cxephy2vkevvt2knsd6u4",
  "1617Cf4qmjqVyiN5weQRo8sZvQvyDjshKP",
];

module.exports = {
  methodology: "Staking tokens via AlexLab counts as TVL",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners }),
    ]),
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0x7ceC01355aC0791dE5b887e80fd20e391BCB103a",
        "0xcD0cb6AA811E1c8cD9A55EcB9Cc83f6a50Bed311",
        "0x13b72A19e221275D3d18ed4D9235F8F859626673",
      ],
      tokens: ["0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", ADDRESSES.null],
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: [
        "0x7ceC01355aC0791dE5b887e80fd20e391BCB103a",
        "0xcD0cb6AA811E1c8cD9A55EcB9Cc83f6a50Bed311",
        "0xFFda60ed91039Dd4dE20492934bC163e0F61e7f5",
      ],
      tokens: [
        "0x55d398326f99059fF775485246999027B3197955",
        "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
      ],
    }),
  },
};
