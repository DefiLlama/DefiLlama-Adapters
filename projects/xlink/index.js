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
    tvl: sdk.util.sumChainTvls([sumTokensExport({ owners })]),
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0x7ceC01355aC0791dE5b887e80fd20e391BCB103a",
        "0xcD0cb6AA811E1c8cD9A55EcB9Cc83f6a50Bed311",
        "0x13b72A19e221275D3d18ed4D9235F8F859626673",
      ],
      tokens: [ADDRESSES.ethereum.WBTC, ADDRESSES.null],
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
        ADDRESSES.bsc.USDT,
        ADDRESSES.bsc.BTCB,
      ],
    }),
  },
  stacks: {
    tvl: sumTokensExport({
      owners: [
        "SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.cross-bridge-registry-v2-01",
        "SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.btc-peg-out-endpoint-v2-01",
      ],
      blacklistedTokens: [
        "SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-abtc::bridged-btc",
        "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex::alex",
      ],
    }),
  },
  bsquared: {
    tvl: sumTokensExport({
      owners: [
      '0x10eeCCc43172458F0ff9Cc3E9730aB256fAEE32e'
      ],
      tokens: [
        ADDRESSES.bsquared.UBTC
      ]
    }),
  }  
};
