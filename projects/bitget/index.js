const ADDRESSES = require('../helper/coreAssets.json')
const { mergeExports, getStakedEthTVL } = require("../helper/utils");
const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");
const avaxX = require("../helper/chain/avaxX");

const evmOwners = [
  "0x0639556f03714a74a5feeaf5736a4a64ff70d206",
  "0x149ded7438caf5e5bfdc507a6c25436214d445e1",
  "0x3a7d1a8c3a8dc9d48a68e628432198a2ead4917c",
  "0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689",
  "0xa316c725bc8401c97d6d96f283c14b827541744e",
  "0xc43999113f8fe724d91356c26105def1449ebdfd",
  "0x8911b8f5127eec40c14e1ad0500dc4dbd279d7a7",
  "0x1ff33329a8f8c1927131cbb72362b00abeea02d3",
  "0x5bdf85216ec1e38d6458c870992a69e38e03f7ef",
  "0x80097a87a7dcde470e34c10b5cceb85abf83b531",
  "0xe4786cfe980ef5a6428a2fffafabf24f1fc79b64",
  "0x4c1d7de286d7c20df5f2ba44b3bc706c1e03bf13",
  "0xac65bdf867103ae2c3a75cdd4b68f9d7178c604f",
  "0x14b5f559c27bc00c39f668a88471498d68d18768",
  "0xe7b3b0a59b026ec1fef16561daf93672a61bafec",
  "0x1ab4973a48dc892cd9971ece8e01dcc7688f8f23",
  "0x1084203d70950bd7a93aef75eb32a51df2422a07",
  "0xbcf6011192399df75a96b0a4ce47c4820853e9e5",
  "0x864a7fa57e0f8902a2de4892e925f1272edbe3fa",
  "0xffa8db7b38579e6a2d14f9b347a9ace4d044cd54",
  "0x092fe28430bade62c7c044b9c77d0aaa06241319",
  "0x934186fd8352fa734eb0df82e8863e6449193294",
  "0x1ae3739e17d8500f2b2d80086ed092596a116e0b",
  "0x2bf7494111a59bd51f731dcd4873d7d71f8feeec",
  "0x31a36512d4903635b7dd6828a934c3915a5809be",
  "0x461f6dcdd5be42d41fe71611154279d87c06b406",
  "0x9e00816f61a709fa124d36664cd7b6f14c13ee05",
  "0xdfe4b89cf009bffa33d9bca1f19694fc2d4d943d",
  "0xe2b406ec9227143a8830229eeb3eb6e24b5c60be",
  "0xe6a421f24d330967a3af2f4cdb5c34067e7e4d75",
  "0xe80623a9d41f2f05780d9cd9cea0f797fd53062a",
  "0xf646d9b7d20babe204a89235774248ba18086dae",
  "0x1d5ba5414f2983212e03bf7725add9eb4cdb00dc",
  "0x51971c86b04516062c1e708cdc048cb04fbe959f",
  "0x5051e9860c1889eb1bfa394365364b3dd61787f1",
  "0x731309e453972598ea05d706c6ee6c3c21ab4d2a",
  "0x842ea89f73add9e4fe963ae7929fdc1e80acdb52",
  "0x1a96e5da1315efcf9b75100f5757d5e8b76abb0c",
  "0x4dfc15890972ecea7a213bda2b478dabc382e7a1",
  "0x70213959a644baa94840bbfb4129550bceceb3c2",
  "0x54a679e853281a440911f72eae0e24107e9413dc",
  "0x0edd5b0de0fe748be331186bf0aa878f47f601db",
  "0x4121217c238db06e942f3d87371106d30d0f8c84",
  "0xed470553f61f23cd30ccf51ab066dc1598ed0c4f",
  "0x59708733fbbf64378d9293ec56b977c011a08fd2",
  "0xaab0039de2a8dba8696ee4d42c0d1aa30d7e1059",
  "0xf207b2f9f9417fc73cad069f7aa5ae1c6a5b428d",
  "0x4d216d2682f3997f6c19420beee4530d08d0ea5f",
  "0xdbe46a02322e636b92296954637e1d7db9d5ed26",
  "0xbff5092f83bd810e0926068b89633bf66eaa037b",
  "0x3c2a309d9005433c1bc2c92ef1be06489e5bf258",
  "0xe368759445438b8ec4e50bf4094e939341174e62",
  "0x2dd64ee5ea8706097a5674154288989e3dbe3a05",
  "0xa700c091687afbfada6b84b5e02a5e672ee35597",
  "0xd509ff5d6e530401b53cc7d3b80607824d85ff60",
  "0x255e91ab794da40d39a5aceff20d98841df873af",
  "0x9756b4eedc434ca23dffd209c8ea01d4c95ff881",
  "0x9a449ef3665f60af503ea5b8ef5191aeb315b809",
  "0x58751ce78f174b58b8f5e345244984a78524a899",
  "0x9f199b93ae33c330880bdb31422fca37c6d3fb14",
  "0x9c9c8f4f33679ce7f2c46cbf8ab4feb4cf45fe46",
  "0x8028270e06fca18e212306a7c93bfee52b440fc5",
  "0x0635ac6675e05c7f58383493bb7d1a513cd65688",
  "0x1d774ed0a7b897aaae3526f07e487c5f9540f55d",
  "0xec96bbbe895301710a89a06546264ebb4f0cc546",
  "0x95ccca6d1859ae5670c2213940c96dcb2e177fcb",
  "0x26209d9f0dc3ac0129c3fb1badabfeb9ee728c66",
  "0xadfffc33cdc9970349cbcea3d73ec343d6ed116d",
  "0x81fb786799ebacc67abc0abaf5589aa0d7773fa0",
  "0xf2c1a45ec2013c686c9568a4f250158c425e4373",
  "0x0c4681e6c0235179ec3d4f4fc4df3d14fdd96017",
  "0x9b0cb31f3e9232196aeaa7cac03ea95c5a4f0e35",
  "0xed9ab5bc05a0152b9dc2f7902e8369af7bc18771",
  "0x15560877043a89358f59b3896dfac2a3e1212658",
  "0xb41cc5c62fe06eecb096fd55d70cf813fbd9a3e1",
  "0x7c539b00719ec375a016032cc3a5b1f8e3a2f31e",
  "0x8a4af9f649434350f795fa7ba7edfb5404b9b078",
  "0xb3e8a3b17c50f077685bcdef2ca496e54d91c4bd",
  "0x4cad1efbfd5f0848e0c3c14fab23f92b2fa81f17",
  "0xa4856e07d14045014b2c3fece5460bd37b310f10", // add on 05/10/2026
  "0x46852e1ff32739ddd2623bd06b27ca39f1143cc7", // add on 21/10/2026
  "0x95047fe21071e8038810975cfc9ee6da7dee33a4", // add on 21/10/2026
  "0x43f17ce0473709e9f5c91cf950811171a248556d", 
]

const evmChains = ["bsc","ethereum","arbitrum","optimism","era","fantom","cronos","avax","polygon","metis","kava","klaytn","base","hyperliquid","sonic","morph","plasma","robinhood","arc","sei","monad","linea","scroll","wc","megaeth"]

const config = {
  tron: {
    owners: [
      "TAa8e7U7seCy7NcZ52xYVQXXybFfwvsUxz",
      "TBXEdr2pD1tszUNAkVX18K7nie1MptkZ1y",
      "TBytnmJqL47n8bAP2NgPWfboXCwEUfEayv",
      "TFrRVZFoHty7scd2a1q6BDxPU5fyqiB4iR",
      "TGJagVsVg9QSePG5GreotgdefgaXPRo8SH",
      "TGZ959FTLRk8droUqDNgLxML1X9mEVej8q",
      "TYiQTHtgLo6KX6hYgbKLJsTbWK5hu9X5MG",
      "TZHW3PJe6VoyV8NWAaeukqWNRe3bVU7u8n",
      "TBM2FK4KBEEsMVYjm4WAW2Q8Es2NKdmUB8", //add on 12/01/2024
      "TCvfZC9h6fFXnF7KbHPgY4jgfen93VkfVW", //add on 12/01/2024
      "TGp7SNzjrctsWNwaFFN2PNTh3b1Kgxdtib", //add on 12/01/2024
      "TBpo1Sh7vKCLrfxocZHd8CA5wc2R75kSJM", // add on 27/05/2024
      "TMauqkA78pfysSTn8jD1dvEUkjme2gEEdn", // add on 27/05/2024
      "TKPqvBMU2v23RyjjViKvp16kiHPx7FnrHQ", // add on 27/05/2024
      "TVSdtELybCCa9DPDH15CMAPjeRcENAmDJZ", // add on 27/05/2024
      "TYPUgo9ZtYk34XgBHbCHJCaoYZ5RejhhVD",
      "TKurFA1LqaLU6cYa7QKbYqFceT3Xf22pNT",
      "TN9DMsWq8CwE9GZV4akjxUzwG93PPceuiV",
      "TYAdiDkvjsSPMQt8AvA8jWJrXKcjyKb5rs",
      "TTky11V7Q3ng6hkYjLs3R3YkeDB8suQ7dC",
      "TJ8kFqncqv3GP15DTcbzufX5HFgFMCK3kC",
      "TEk5sAuuk6URqvT5tL7hrUB65NGEgq895X",
      "TJ7hhYhVhaxNx6BPyq7yFpqZrQULL3JSdb",
      "TWpNmnuq6EFMRnxWQTGGf47gjkkbtYJdbm",
      "TKfMrRSwhuLoTHcziSeNEAdSjaTe2677md",
      "TQQ29P8gw2Tp8XeYKC8vasQmJ7rvHGFhiG",
      "TUktrKwLLGGjks6DoN1zGta8muskbd9tnk",
      "TFfNrnZzHVMQ7DsHLvcTyvZheqabG4KW4W",
      "TKCFasXqJw3ezQiF1qYWYd78Edfb2NvpBV",
      "TBf14pAU2aZ2kYjnfwDgcVDF2nH6kVHhkZ", // add on 21/10/2026
      "TJxe1MWrb5ppk3beWArqU2Dwg3jvhGUGx5", // add on 21/10/2026
      "THxgDFGkDejK452u9uumRY3W1KCjj6dk2Y", // add on 21/10/2026
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.bitget,
  },
  ripple: {
    owners: [
      "r3AEihLNr81VYUf5PdfH5wLPqtJJyJs6yY",
      "rGDreBvnHrX1get7na3J4oowN19ny4GzFn",
      "rwTTsHVUDF8Ub2nzV2oAeWxfJzUvobXLEf",
      "rMCVBYFYtVJy6F4gUSd7RrM8GXApM6MNDN", // add on 05/10/2026
      "rGxYmmME93guyy4HuNv1bRf6gak8vGNN4B", // add on 21/10/2026
      "rnQ3YeYzjkLS1oum4FZ9HXzAksm23CaQGS", // add on 21/10/2026
      "rUKr6eh6emrKDg12rT3XDMrAbyeu8r2BnU", // add on 21/10/2026
    ],
  },
  solana: {
    owners: [
      "A77HErqtfN1hLLpvZ9pCtu66FEtM8BveoaKbbMoZ4RiR",
      "3bLkLrRvkwHMrqyoCaDSCn6bZnpfJCVsHxcmznUwB1p5",
      "42zAGwv37eZFwwcExfCAV9oSw2kNQX3aBxsbM6zvQECM",
      "YiZeibU6zzEHyKiSTjygXUPkMktKj9a3DCAcWmZ4XjF",
      "AvLGED7RBzYv4AuvkgFSCFMqyB2WjUff7TVKVEv5MjMs",
      "48Zo7g9SReCWmNtCvr2es4H9CLCRQHrSND2Wzi61sCsQ",
      "57WSBnNTC2MaqpY6NWLdNjhrELced4jSGV2hLSpjzct9",
      "DP1FqoBnE23QNNz4LpT9FCQvETdJN4nph5c11NiinrGg",
      "AyhsmFptkM251V1AoH2gf8d4QUnxUkkmaDqFfFwBwGni",
      "4S8C1yrRZmJYPzCqzEVjZYf6qCYWFoF7hWLRzssTCotX",
      "7TWnq4WeYcwQWBCwKeEX2Q9xqVtthPGkB7adNvueuVuh",
      "EPxGiguU5j5tKFnMQpzMrzczEQ5NRtLWrpG9fADvtadX",
      "8ZPaybdHeNwpoxmU1ALcbLoE3eK443Jq4emk82VCscag",
      "3RtJvxpkok13LGQsQ3Ye4QvCkbP3ioMpra7ccuf9XqsF", // add on 18/09/2026
      "Bk57qr4wSvzCqGKHD2vAc6n88oHyDoD8b3HnvGEF5iQN", // add on 18/09/2026
      "3NCT4RE6ix2Qfdw1c5kfNYBfJmVHPcJd9cABQ6aP6Zzg", // add on 21/10/2026
      "7ScZfANFtjzDZWk94DLb2eZUs8zBgYmnotYrsDd1MfYv", // add on 21/10/2026
      "HnxVDcZamsojYy3AFZndHEtQ9y5sf1H1V1pyLYyWk3BN", // add on 21/10/2026
    ],
  },
  doge: {
    owners: [
      'DTHZron9cR6WstH6VcdsVZwSbVDEnFKkGQ',
      'DRoaiomCBuDGEpZGw2d2xmXP9ffKcfhuuQ', // add on 05/10/2026
    ],
  },
  near: {
    owners: [
      '241754260760e04e3a90acf27b1c54296b81e52a3b21fab8347ae88066946092', // add on 05/10/2026
      '454e9a19b4552d08132efb9db354f8cdb1ceb155d8c2c9806f6cb15d947187cf', // add on 21/10/2026
    ],
  },
  starknet: {
    owners: [
      "0x0299b9008e2d3fa88de6d06781fc9f32f601b2626cb0efa8e8c19f2b17837ed1",
    ],
  },
  ton: {
    owners: [ //only wallets with more than 50k
      "UQDJlZqZfh1OQ4PY2ze4bSEBznjc8fGzkE2YiP5XLvDv1JNr",
      // "EQCnRoi95R9jLVrPONxTWEMMCuIlHBsYZjYZW5JwtoecbRl6",
      // "EQC5Jj1PfKD8PmwxdBDi47mtbLahHV0Qkrs39lVl2A4nPlPC",
      // "EQAkKBTk1NuRH9wuy5qJFesfCoZMvZXa2NV9mCet3t3ndwkH",
      // "EQDN9_DXwJA28GQnLjxCntVwvknvKes6c1tku8F5FQc3MkZo",
      //  "EQAGQcXOz5QWPXW_faObcN7HfSx8ihstAzoQTV9ckqmrDfcQ",
      //  "EQCUlDMK5NDVOmpbLAzGVkXfCXpmEJgKWHL4J7oHmuNkPxaH",
      //  "EQAWLm0Xut7koqsFxI2j3YBvjI1M_tVHXFrgTysXvF4NQWu5",
      // "EQAGR25YDiUNCr7Fw2WnEYM0g8WB1XuQi-N9Vr2w4zjDEhg5",
      //  "EQDpwKJP-qaqTyKIkOca6VUL_FOmxX5kO8McJA4YcnrBzlwi",
      //  "EQAzZQL6-D71tTLTFbpxRQtmHJDoP85k2Lwf0r9kLzVV2VRy",
      //  "EQCzCMf5tPWW9iUBdYhZclSYcbBccO02Gf1ak5QB7qly5Gsl",
      //  "EQDi0d8gazctsfO4kOYNGFtnqgyfG2tv9goFCRyMAbQKxMA3",
      //  "EQB6DclNqfSLlo37h7441Pq3KGKI23oE0wgf7uF3N22QicZ7",
      //  "EQCHhe9euw_STGkR0Q9DwAlh6XSPpUKXoaxRfjxf52uwvmGB",
      //  "EQAhO2gEwgghNaSoA9qOOzDP7VGu6a8q0hADNLf0cR07zMQr",
      //  "EQBXPf6ZSQoEFwPpd-RyQTXFuL6gvqZ4OWEiR0UcqdXEywxy",
      //  "EQDeJRmlJ95-HUwQKL23TgIrKKbjcOT-w_wn2NlxMI-Zu6i2",
      //  "EQAPGaGPsc-vwzQB04IyW63UkbS08btCmfD51vvHm3FQFYbg",
      //  "EQA182-9Kw_8YCugScsCS03ln3WVvp5gZpLU7lbS3xst3GiN",
      //  "EQDqltnjUhoZxMd022XDb8egHj2IQOlegwXD0rfJL1d8eyOZ",
      //  "EQDY6SAYmiZ2dc3qWZkqSB1JxPgyluCBNJe5DCeUBXKVvpC8",
      //  "EQB5AOHMT1UHXa4WBh_LL3HWqPeYMSoCNfDarrUOSSiI-2LE",
      //  "EQBi8zmTQRJNfGhdpG2RoHqhSWhN05fH5f6YaCCom4dsAnrT",
      //  "EQBcPW3DG9p9UG-FiOVbq6BiXAxTWRYSgwkeSHK9vAHJauTe",
      //  "EQAMReXSXKXMgNJsiQbeUYqG_BoETp6V11p2AQ0hBalCPUvU",
      //  "EQD7T5jBR_4NTYpyQTsbE6UTcSgM31GM-tUQsxzwWAW8XyuS",
      //  "EQB8Nfcr7iJARqpnwHI_dowkRu9k43b8AMj-p4RJTXosLWWv",
      "EQDAflHltpSTd1j0X0ADBxyE9MSmi9sWiiLD1si4nNYYb7Kq",
      //  "EQBAdstQfrjD8XODZjA6OL3sE64rEjDFSPSjgXdllH4EYbL_",
      //  "EQCJCWcpv6SSYKI9XpCOM8wazXTay7Y9eJa1DjvqLrBj0DA4",
      //  "EQBczmMu9joi0XxD36P0UDZqCmCVZ6lXkQ8EnX73Dz8bFxtS",
      //  "EQDrU5ouMx-D_RBtqKuqPGpGvS-O4B-kUnXW-q7RulrPmAfa",
      //  "EQCkEpUgZvV1vD4n1Zs3SSdxInEQh1QkxubbrmHonEywvJ5a",
      //  "EQDHy0OTba2_affHgdhHNtC8DW0CjAYdM6np6HX8yjqFo1hL",
      //  "EQA5O1iYS2jpYbP2_z0WCbWRmyiaDQ-thu-x_Jkhzu-DsnEc",
      //  "EQCYL0iLg5WpiX2G8IBeFIGNVCy7LQ_hyf5iZ9A3ezFg5Atl",
      //  "EQClK4F-Kyfg7-h7CFMedd4NOMQN3Q_GUXd8b1i863SAdeR3",
      //  "EQC9yQc4ukdiARwzowoBnlQSI_t_WrW4vM3PZAJtlzmxkRGj",
      //  "EQBCDb94YxZuR4CsuOu4G9N0pm1U6ezgOhHEBiEX2LWD2YJi",
      //  "EQDKubNbxKBrbng_VL6CiPWG43crC3zogxRi-kSzxxPjw35F",
      //  "EQBtm4dCmA6ee0TdGB7OM_ugptfPSJQnZ9t8lEn3333sNE0u",
      //  "EQB9FPf68No-lbXCKDRKdswuMr1tAFdXKb5wb04CAtkTgPu7",
      //  "EQDRb6dbCI6kvhE5Mdnp60wc7fNEU7bpTyZkvGnmOLMqv5tr",
      //  "EQBABRMAjj3FdNo6KkeSP3wLrSL1oBPgogH_vojzNnI0ZI9l",
      //  "EQAhwpa_TxKq4vPppejylixsCucMNrOJUUHOsEk6TP2ExnOS",
      //  "EQDQPzhpD1ygMNgnPiD6k6d2S0FWMdJasy3Z3eOQTujARKDD",
      //  "EQA8Q5etDAwMseoEFLPfN8xUL9wQhi3hNzs4eFlXNIuB81Tj",
      //  "EQA70IHk3sI76igys6-kLC0TLxXo54s0qAwdbSRUOpqgneV3",
      "EQDJlZqZfh1OQ4PY2ze4bSEBznjc8fGzkE2YiP5XLvDv1M6u",
      "EQAXl6XExQorMSzpkn_28S79OwtY_zEURRGMLS5kMStdeQng",
      "EQBggwBbNUqxxHhaqM6Ck-5cnBgukkjyfpyQdPNcFjQggwrJ",
      "UQCe6OZlNFHXWBai5V3CzYsdO68yZR2GMdMYWO6NJ1wYi5PA", // add on 18/09/2026
      "UQCK-8sWM1jrIL4a6bYQopOAONhKEIfn9JzMv4BG9ZyFn5M9", // add on 05/10/2026
    ],
  },
  cardano: {
    owners: [
      "Ae2tdPwUPEZKnykUqXyYQxqJSnADNkm4ELUnyqZUBHcCrNJVDqozLYCt9Jv",
      "addr1q8cxktsw8qm8zqj0ru28s9q8yxgqlznejhtku7e22ww2xe8sdvhquwpkwypy78c50q2qwgvsp798n9whdeaj55uu5djqyhdfkl", // add on 21/10/2026
      "Ae2tdPwUPEYzbrfg1PRAMswDuoY3VusBRyVEWhE4QBp2CMj8QZc6HcVEiB8", // add on 21/10/2026
    ]
  },
  sui: {
    owners: [
      "0xce7e1e38f996cdb2c4b78c1d187d23c1001d7b266f181498677672f9b1e24ea0",
      "0xb7b7a848fdc47e22e5a04816bd8d37143a164617d3fd16944f586efd1edfc4bb",
      "0x9529d8d9621874f60e342e3f0f049157eda68b2d5085f6526b9fced8913b97a8",
      "0x3a1520d6be3a16f89655f542f6e5b050d3065ff67d7287ed8005259c4a0b36b7",
      "0x98252cfb5f8481cc4e395deb88000ffff5ab8fdd870be91fc48abfa83ec21a10",
      "0x344d78ea46fb432ec42e29dbfc29bbad017b3400d9b4d55711d62448f996c9b5", // add on 21/10/2026
    ]
  },
  // chains below added on 21/10/2026 from the bitget address list (wallets under 10k usd left out)
  xdc: { owners: ["0x68c34a122c3b632e7ecd39f553dd5ffc1433f45b"] }, // xdc68c34a122c3b632e7ecd39f553dd5ffc1433f45b
  harmony: { owners: ["0xb09dd9c27da4cbbf28f92109eb13615b34257fd3"] }, // one1kzwansna5n9m728eyyy7kymptv6z2l7n92uudx
  fetchhub: { owners: ["fetch1s3l4s5f2j79872qjtt9f3p86vxxyf6g854lw4v"] },
  zcash: { owners: ["t1Xd1Lx2EXi2qwE1Kpc2F95TE2VrdKuJriY"] },
  bittensor: {
    owners: [
      "5ELWnR5A7DUmmqHsYPA3iZMFu1BX3gceruEqFPtsmTkCqR7J",
      "5HbDZ6ULuwZegAMSPaS2kaUfBLMDaht5t48RcDrQATSgGCAR",
    ],
  },
  pi: { owners: ["GDFNWH6ZFJVHJDLBMNOUT35X4EEKQVJAO3ZDL4NL7VQJLC4PJOQFWJ75"] },
  aptos: {
    owners: [
      "0x48d1db7cb8529f17c88300515ed068bb8bbf01e6bd60ac81071d1160562a5144",
      "0xbabf76f1e6ac1af9c2666c07be12f90b188ed484fcef0bf1408961b5461373e9",
    ],
  },
  litecoin: { owners: ["LSm75uocx76va8UvrVqyTztkWwXDvjS416"] },
  stellar: { owners: ["GBD6CUO335LQMOIZ53CE3L6QJ3X3DAQVC7F5TWE2BKI7AQWTHDUHFNJ4"] },
  hedera: { owners: ["0.0.4735544"] },
  kaspa: { owners: ["kaspa:qqywx2wszmnrsu0mzgav85rdwvzangfpdj9j3ady9jpr7hu4u8c2wl9wqgd6j"] },
  polkadot: {
    owners: [
      "1hBczpJHSWrEejKT5hevU3h2oBKNBpY26zPo7jTpVanj3JV",
      "13KjpoC6rn9NsKzweB5p68oBcsp77NvMSGdp6BZTMHjHTupB",
      "15u2N1pqWr56teREjQTP5M3tk1SPQjEoUAV6jFfcQCoVy3S5",
    ],
  },
  injective: { owners: ["inj18seg7en3tdhy4ugvfv3s93srapdlkkpv6z56r4"] },
  icp: { owners: ["bad030b417484232fd2019cb89096feea3fdd3d9eb39e1d07bcb9a13c7673464"] },
  algorand: { owners: ["5622JWBD3TDOJUTGFIB3H3TI4JE5ARW7W3WQL6JIJQ5ATFQISRSBVKOD6U"] },
  canton: { owners: ["bg::1220ea89032d4307c135ff8dadbb0b52f9326cd337a7208b0ac4a357bb254acee9de"] },
  celestia: { owners: ["celestia1jm9gwpdk0v69kva9hepgnprfjl3u2z4duh9ver"] },
  bsv: { owners: ["12ov5BL4NbCn8GsdeV6fdPa5HrHGsdAopK"] },
  qubic: {
    owners: [
      "EXNRRBDPYFQPXFPXCMUHZVEEBRQCBEAUDYUBHKGTRCKHVSRAQXWHQCXDLZXL",
      "JAKDBYHQOUICADHMNZMCMQIUVLZCTCCGEYNLBBGPBFNNTVZZCBCIMWICCFHN",
      "YVUFYVKKSHOXACARARSIKCBJMFZAFHTGUNAALZAFOFBAXOCJEPBYKTCCDEMJ",
      "VYHFEIJMNILNIBWYRRBXEQNGKFGAKFRVYQTYZTBIADXKBQASXKICMYAEZXBG",
      "WZQYIRBZASLIIFBIDJZFEUMUEWACTSNKVBRPLUKJZFGCSUTKHDCYXJYERBIE",
      "OQGNMLUVQCMUBETYQXBJMBPDTJIARHYVUZOAZBKSNGESLFHFQYLWNULFTZDM",
      "QGBXYBWVPJBKUFWZLUSNYQBAWVQDIDBWVBXGWUHYTABALTDSNTCEKPVGKXTA",
      "LVGVWADWLDEBIFIASRDFSBKKXIFALOZOSCCFSLIGNDKIYHWUKZPPQNBFPSSF",
    ],
  },
  arweave: { owners: ["kvxXYE6q7v6LrmQJLBEQZ2abWDdVyjQDERqM1YeMvf0"] },
  conflux: { owners: ["cfx:aam5xn1e71juzwgs4e94t3yghj1ayw1b56zxk7bv8u"] },
  terra: {
    owners: [
      "terra1j95fa7sdyudcw2rf96kyxdv42l90k0x8xtc8c3",
      "terra1vq3dyzwxrhlwxkl9ld8yjxzpedcs75h7w3afr2",
    ],
  },
  cosmos: { owners: ["cosmos134amdum68rsfv4wpkanx253vw6zkmmfa3ssrxa"] },
  stacks: { owners: ["SP28TC4FHYSX63N7FTV56A6GJE5B0W79W1WXJ9262"] },
  eos: { owners: ["bitgeteosdep"] },
  oasis: { owners: ["oasis1qpfpj0fr6tv3k54p2euddyj6lezm5tfqhv3qjtd6"] },
  thorchain: { owners: ["thor1ye3jyw5nfnjrch4wk7zxuuxvx3wjuv9nsyumpr"] },
  dydx: { owners: ["dydx1zgx5m9ly6fzt4y9tdlnxa70u96fr5ygjxjzmhg"] },
  nervos: { owners: ["ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqt9xmgc7s0x0ly43qpzev2er4w4320lwdgw4anh7"] },
  mina: { owners: ["B62qkoFGnaoAzVayqjkMYaP6ZiGrSnzSUovCdnJFfosEEKBsxEcJmrs"] },
  alephium: { owners: ["1GS8Hv3Fxm2Zduxek9Kr85LL1qAC4tDzbVaUiJbcex3qV"] },
  xion: { owners: ["xion1gaym9l53jwp5na0kpv8h5r5kuxs0zpw22ugx6v"] },
  babylon: { owners: ["bbn1fge5jh75e9psm7qses6fm76sh4xyes3tfye9fj"] },
  elrond: { owners: ["erd1w547kw69kpd60vlpr9pe0pn9nnqeljrcaz73znenjpgt0h3qlqqqm3szxj"] },
  tezos: { owners: ["tz1SCKYfZFZYYnL2fXqnLxdCtxBMLuYVG79s"] },
  mantra: { owners: ["mantra16l5qsgzjueayxa2z78eee53lv3t0kfy3z68pqc"] },
  orai: { owners: ["orai1y2ex6nyqy2yktaa68qtmyctlgqu2cddy0yccpr"] },
  astar: { owners: ["ao2MGHJeJFCcnUEJbz9vrNX3UMf4MFgR6TF7vCJcP3s5vzx"] },
  osmosis: { owners: ["osmo1tulvk3qsrt9u3h28z3mt83v97n37as5r2v5w3l"] },
  band: { owners: ["band15m7nzph3v9wvlehjl2gqmhp2avfut6ha3dx3y9"] },
  allora: { owners: ["allo1m2dqn8adrjw9pennccf8v3ttw0ulytzhpuk7ax"] },
  initia: { owners: ["init150mx83aq0jsuczew768maz2dv8krr8zufk6ye0"] },
  kusama: { owners: ["HEcm1Y7gSPStrk4LZJmc9dZCuoX4XAKmoGPPymt95CBiCqr"] },
  filecoin: { owners: ["f1lxiy73hwgaketpmclhvbtmlkiwtvdif4agotcdq"] },
  neo3: { owners: ["NcrhQoW3a5FrB1mUUKAwvWXhPt9cUWU5qr"] },
  ontology: { owners: ["Adt17RqjNdMw2qwFixEwsoruQ1J18VKfDw"] },
  proton: { owners: ["bitgetxpr"] },
  massa: { owners: ["AU1sxVCyy9E7f3nr1HSwbgNQH7SUuQUnb4BXxCzwMzYdRijZi1qY"] },
  platon: { owners: ["0x685e9a095deeca5023eba2c292f7fe671f9a6da7"] }, // lat1dp0f5z2aam99qglt5tpf9al7vu0e5md8t5n5ys
};

// Avalanche X-Chain wallet, counted on the avax chain next to the C-Chain balances
const avaxXChainOwners = ["X-avax1y9gqplplrrmpqdqgp0k6ketpufny2k9vxnlfry"]

evmChains.forEach(chain => { config[chain] = { owners: [...evmOwners] } })
config.kava.owners.push("0x602e1c0d892ab4fecb472863b05acd8b1ac4fc01") // kava1vqhpcrvf9260aj689p3mqkkd3vdvflqp0vc469, add on 21/10/2026
config.ethereum.blacklistedTokens = [
  "0x19de6b897ed14a376dda0fe53a5420d2ac828a28", // old bitget token
]

const withdrawalAddresses = [
  '0x334cf9ceef9178c7a9bb5495ac8790e9bed316a3',
  '0x1d5ba5414f2983212e03bf7725add9eb4cdb00dc',
]

module.exports = mergeExports([
  cexExports(config),
  { ethereum: { tvl: getStakedEthTVL({ withdrawalAddresses: withdrawalAddresses, size: 200, sleepTime: 20_000, proxy: true }) } },
  { avax: { tvl: avaxX.sumTokensExport({ owners: avaxXChainOwners }) } },
])
