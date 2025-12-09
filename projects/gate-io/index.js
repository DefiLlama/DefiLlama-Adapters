const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");
const { mergeExports, getStakedEthTVL } = require("../helper/utils");

const config = {
  "ethereum": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0x234ee9e35f8e9749a002fc42970d570db716453b",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0x246a2ecd9626f9eda55fffbff5216ed417a904f5",
      "0x840760aed6bbd878c46c5850d3af0a61afcd09c8",
      "0x35b31ae2604dd81d9456205025ea02418dba8242",
      "0xd87C8e083AECc5405B0107c90D8E0C7F70996B84",
      "0x60618B3c6E3164c4a72d352Bde263A5D15f9F7eE",
      "0xa4992ccf2a74132936b87cbf28b5d52304ba3be7",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1f92332145465f3e536b7be301dde8d420478387",
      "0x2bea9375c50f41f828c4e8eb0da3194449b5f062",
      "0x54c82d26624e85000d1387ee7c9580c3c6d7b5b7",
      "0x0fc73ffb9a0ded685234428e103d26b3762df460",
      "0x7750fe679d47a9e00575ad46043297a234e83fa2",
      "0xa2df23519a6059dbc6f027f6cf8e59bdaecaf56f",
      "0x4bbe1961bd0a6cd1fe3cd8947be15bd8ae2ee562",
      "0xd793281182a0e3e023116004778f45c29fc14f19",
      "0x354e0184a6a6e634ccb07388e2617e05e427563c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421",
      "0xf379a3d1ab6625eef34347d054cfaeafdf8f24a7",
      "0x9bbe47fe66b3580551aac3124cf9fc6560252b19",
      "0xaaac1183d07c69f5befd22a06211690e953dca17"
    ]
  },
  "avax": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
    ]
  },
  "arbitrum": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421",
      "0xf379a3d1ab6625eef34347d054cfaeafdf8f24a7"
    ]
  },
  "polygon": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xa4992ccf2a74132936b87cbf28b5d52304ba3be7",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x54c82d26624e85000d1387ee7c9580c3c6d7b5b7",
      "0x1f92332145465f3e536b7be301dde8d420478387",
      "0x7750fe679d47a9e00575ad46043297a234e83fa2",
      "0x0fc73ffb9a0ded685234428e103d26b3762df460",
      "0xa2df23519a6059dbc6f027f6cf8e59bdaecaf56f",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421",
      "0xf379a3d1ab6625eef34347d054cfaeafdf8f24a7"
    ]
  },
  "fantom": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xa4992ccf2a74132936b87cbf28b5d52304ba3be7",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "bsc": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xa4992ccf2a74132936b87cbf28b5d52304ba3be7",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421",
      "0xf379a3d1ab6625eef34347d054cfaeafdf8f24a7"
    ]
  },
  "optimism": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "era": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0x234ee9e35f8e9749a002fc42970d570db716453b",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0x85FAa6C1F2450b9caEA300838981C2e6E120C35c",
      "0xeb01f8cdae433e7b55023ff0b2da44c4c712dce2",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  bitcoin: {
    owners: bitcoinAddressBook.gateIo,
  },
  "tron": {
    "owners": [
      "TBA6CypYJizwA9XdC7Ubgc5F1bxrQ7SqPt",
      "TCYpJ6MMzd9ytoUvD82HnS58iV75QimPh6",
      "TDHkXgDHEiK5WhaKTccJenZKRyUMTxoREx",
      "TN1K2zNVA399AHbp51yyPPfjaD9JNLfQpo",
      "TUt2HuZFZvXAMmF9uh7BqujvMXsZ4F1pif",
      "TCr9697xxWMbZznvpJh8uVQzAQR9cLXZm9",
      "TDyR4wBeodpigiKmnwyBQC8UfsCH1T25XF",
      "THhVZfr2Q4J3spWK84Je4ALiFyrnnSq6nN",
      "TZJNuEg5VaYLR9kdQfjj7WE6jh4vt9JMp2",
      "TYAavN2xCDro5Gdip8UU6W9oQmM43rNxzQ",
      "TLsUUQZCkcrBRxEKqZbpekdq9LWfmnndPg"
    ]
  },
  "cardano": {
    "owners": [
      "DdzFFzCqrhseMuShaXzLDGDBa8jGEjdEjNc83jouqdqBQzk5R52MedutUq3QGdMPiauR5SjbttqdBjDA5g6rf3H6LjpvK3dFsf8yZ6qo",
      "DdzFFzCqrhtBatWqyFge4w6M6VLgNUwRHiXTAg3xfQCUdTcjJxSrPHVZJBsQprUEc5pRhgMWQaGciTssoZVwrSKmG1fneZ1AeCtLgs5Y",
      "addr1qyzppj9mh28q9d7x070j7aphnn6dx5lsh203zukzs7q68jqf08fcmxg8h9tvx8m529hjjnm9g3pt8vlkh95em7nup32sm78295",
      "addr1q9lqxlvk2dk8sffhr56gc4c4lckpv56l4r7wwh474caywurve9ssnt966vmezsfsppfm5sxgu5sqxacp8t7kpjzp9yxqn24ckj"
    ]
  },
  "solana": {
    "owners": [
      "u6PJ8DtQuPFnfmwHbGFULQ4u4EgjDiyYKjVEsynXq2w",
      "HiRpdAZifEsZGdzQ5Xo5wcnaH3D2Jj9SoNsUzcYNK78J",
      // "CLNEVwuSAiGsvPtE74yLhda4beNfd8qfZXVKkUcAJZDL",
      // "CVMV7614DjSjY114GwHhG1HNFXofceziDpuGz7VjDD5K",
      "G9XFfWz6adb9wFDKN2v7HfmJDgAc2hirrTwBmca4w26C",
      // "E2tbmDk29G6jHdrgwHC6kXGFfDsyrXUyWjD3e3ZB4oNp",
      // "EnYo9PZuYwhJNi2hnk5AgsJaoNegscFF5CJkSPx1f7td",
      // "HMbkbJVNitT3t4EtaDJeUtwfTFGYcjU6vhE7h7dqxDzJ"
      "Egf5D8NKBivJavLKmCssE93J7X6fKvEPQwFTWLZUnaSN"
    ]
  },
  "ripple": {
    "owners": [
      "rHcFoo6a9qT5NHiVn1THQRhsEGcxtYCV4d",
      "rLzxZuZuAHM7k3FzfmhGkXVwScM4QSxoY7",
      "rNnWmrc1EtNRe5SEQEs9pFibcjhpvAiVKF",
      "rNu9U5sSouNoFunHp9e9trsLV6pvsSf54z",
      "rhnS6iYGnrmh8NEgEKq3sBgF4FMLD9dHGf"
    ]
  },
  "starknet": {
    "owners": [
      "0x00e91830f84747f37692127b20d4e4f9b96482b1007592fee1d7c0136ee60e6d",
      "0x016dd5370bfa06e862508e8b81b8f676327b55404231bfb5b34c1df10ddd8963"
    ]
  },
  "algorand": {
    "owners": [
      "BVMEUTF37WNEQ6GYCZISRFHGLEMOKT5OCPPTTJXVED6JBSXKF6YJJRZRI4",
      "7BL55CRKRASIQI263JQ5H5A4JJQFSHL7RWXMCKM6YDZAIJVEZQ76SXF2S4",
      // "YGR5VO4VWBTWPWZKXBPNBPUGCM5BLP7DVAH2AF6LXAZBM5QKQGAXY5IXII" // getting account not found error
    ]
  },
  "base": {
    "owners": [
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0xa4992ccf2a74132936b87cbf28b5d52304ba3be7",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0x1f92332145465f3e536b7be301dde8d420478387",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "litecoin": {
    "owners": [
      "LaH52f9sspcacPMf2Z7mU5tkhKcWJxvAgA",
      "LYyhXjiwi7qcrf1QVwdPpFSptwRZ8L8PuW",
      "Lc3BUJTitygdVPCyiBTwA2HephzBKnHPaH",
      "LNyjBuigbWcHYQYbVKxk15u3Ux23QvEnS9",
      "LQFZFmkrmxuyL5TCjuVxngM4wRFdM2a9EW",
      "MQ4wXRL6etqkEPrLm4f1FKu2eXTM7EMgXo",
      "LZZH8R24wpRVN9g2qM9Rh2BmfcTvThDtpE"
    ]
  },
  "manta": {
    "owners": [
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "mantle": {
    "owners": [
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "polkadot": {
    "owners": [
      "1JVrK16XZm9vyZjHoYVPjtZ35LvTQ4oyufMoUFTFpAUhath",
      "16ccyj8JqnP8d2DSaifgek6kSSBAu5cGtd4mu2uXTg4H6mSU",
      "14ooXLY2gmiUTVym9SnKxNwEgcoikXzMEav2kiLjr7pPPHPR",
      "1665ypcQXKmqXtjE9yuWsZqK5MQmBQokFjPGLq5SvoKAWBjQ",
      "123tA7zfH9XdqHX5v9W4mB4VfmrjE95yJvdvMbpWv5V851rX",
      "15NtvAi8CGHrbaUBvXdki8GXc5YfHM9yTv6HGmaYDetLH2ob",
      "15dZTKqG6YZiQNiisMZP1DT4J6J9bmEEC4Bkz24nMC1ccRe2"
    ]
  },
  "scroll": {
    "owners": [
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "sei": {
    "owners": [
      "sei1xunyznpjmj9jv5e2zwngp2qrzmulr2gg45sg0h",
      "sei155svs6sgxe55rnvs6ghprtqu0mh69kehwl7mxz",
      "sei1jm068whkhkxk48gx80ppm2m0nwy677prmjk402",
      "sei1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9vsqw3v"
    ]
  },
  "stacks": {
    "owners": [
      "SP33XEHK2SXXH625VG6W6665WBBPX1ENQVKNEYCYY",
      "SP15R31KXD5C0N9ESSG7B28M3DP6ZQE2GSED759B3",
      "SP3RWVFCERVDYEE1F9630H13P0Q0GEAGDC9MW9BJ0"
    ]
  },
  "taiko": {
    "owners": [
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421",
      "0xf379a3d1ab6625eef34347d054cfaeafdf8f24a7"
    ]
  },
  "acala": {
    "owners": [
      "21B6SER8NUWRVZcNM8LjAkYoVvms1EN1sKCfxJgTtN7MWpWm",
      "26VDZeYLgh8QBcG5e3TvRkkzuHc7SuuUn2c63sLY6E19vDaU",
      "24gQ7Fx4XgTk262QCmaZjPbV9UEfJNHZ7zTLuYmkUfmGCMwH",
      "25FVW68A3B38AAWpyrRzV8vn4vybqBTBMKdbRc1YrCqD64b7"
    ]
  },
  "aelf": {
    "owners": [
      "2ZwykiMYYMPx7NUodb4Z9VRzYqLrrxEpPcVuNKwT3kSQaSerQW",
      "21Te3eubq6Yc7kv2FzVUvBLiyQnTZVe7nXodvexsKSZYBeoYuR",
      "MTCNynuhCFJsFAwExEsXWe6tnydfnyv7WqA1SxVfsE9DT3YiG"
    ]
  },
  "aeternity": {
    "owners": [
      "ak_6sssiKcg7AywyJkfSdHz52RbDUq5cZe4V4hcvghXnrPz4H4Qg",
      "ak_2tNbVhpU6Bo3xGBJYATnqc62uXjR8yBv9e63TeYCpa6ASgEz94",
      "ak_2UHGyGVYKx8L7EgPw88x3Dm2CK9WerYSTVWDf6RLuNEUxKu6q8"
    ]
  },
  "agoric": {
    "owners": [
      "agoric155svs6sgxe55rnvs6ghprtqu0mh69keh3wdjs4",
      "agoric1jm068whkhkxk48gx80ppm2m0nwy677pryr9uea",
      "agoric1xunyznpjmj9jv5e2zwngp2qrzmulr2gg29rpeq",
      "agoric1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9npn88m"
    ]
  },
  "ailayer": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "airdao": {
    "owners": [
      // "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      // "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      // "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      // "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "alephium": {
    "owners": [
      "17R6Ptkz9i1LhiKyMhnitUMkgFygGeeQUFZvRx6GgV8Fc",
      "13fKFYVSosvQZKhPP8izubADEn6q9a4np3uqw3YWjA6Hk",
      "133kTjVSJA9VDrybSVCWahbQ5BQ5WevtLmHoGKp83dGPT"
    ]
  },
  "apechain": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "aptos": {
    "owners": [
      "0x0cf869189c785beaaad2f5c636ced4805aeae9cbf49070dc93aed2f16b99012a",
      // address not found
      // "0x8b88f330e9ee14c6571d6707c48858bdd126d715c5df145eee58f4f4f6217898",
      // "0x107ffec1dd5c5faa26dbff442253ae9fc2cb026e3e9b55a6613c10cc90904a40"
    ]
  },
  "arbitrum_nova": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0xa4992ccf2a74132936b87cbf28b5d52304ba3be7",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  // "archway": {
  //   "owners": [
  //     "archway155svs6sgxe55rnvs6ghprtqu0mh69kehkcnf25",
  //     "archway1jm068whkhkxk48gx80ppm2m0nwy677prr4m8ru",
  //     "archway1xunyznpjmj9jv5e2zwngp2qrzmulr2ggdna6rp",
  //     "archway1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn95hdua6"
  //   ]
  // },
  "astar": {
    "owners": [
      "WEo9Gi7T28niGb3pTwcHFDgGW4PjKDQvcS1stTxa68v73nQ",
      "bYvGgqKmEkmQKEm7P4oYFRsfrteAzksqKqRyT82mx2iWSZt",
      "Zk6pJF3cE67Eo15g7BSqtGMv3XC2T8xBHggq8ZFAPnpnpnY",
      "aKCD8R97ifVNsVWTC2sbdbeqWG8ZGJaQcrwMBo3XvrmgR4N"
    ]
  },
  "aura": {
    "owners": [
      "aura155svs6sgxe55rnvs6ghprtqu0mh69kehc9c0z6",
      "aura1jm068whkhkxk48gx80ppm2m0nwy677prdgsptj",
      "aura1xunyznpjmj9jv5e2zwngp2qrzmulr2ggrwkut0",
      "aura1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn962x645"
    ]
  },
  "aurora": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "band": {
    "owners": [
      "band155svs6sgxe55rnvs6ghprtqu0mh69keh6u00ct",
      "band1jm068whkhkxk48gx80ppm2m0nwy677pr038p3r",
      "band1xunyznpjmj9jv5e2zwngp2qrzmulr2ggphpu37",
      "band1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9cn3609"
    ]
  },
  "beam": {
    "owners": [
      "11d33ef5b07f977a51dc3aad64c49abf56c759c0059a468926b82a133a15b39d7bc"
    ]
  },
  "bifrost": {
    "owners": [
      "c2TQGFWqK1WsKzWizpdf9V6uzCgnVqw7Yz9Va7G2wjQPHTY",
      "hLaXgNj9XdVZNeE1uwpv9hJKM2wEBPQ2GPZb8mLEodCnpB2",
      "fXm5HnSzWxqPrQYae4UDnXnZXfV5dmUNEEpSpCYdFPK4z69",
      "g6rU7xYW1YDXvtyMiutyXs5UzQRcSw6bZR4xsSLznTFxfxW"
    ]
  },
  "binance": {
    "owners": [
      "bnb155svs6sgxe55rnvs6ghprtqu0mh69kehphsppd",
      "bnb1jm068whkhkxk48gx80ppm2m0nwy677pr56c0g9",
      "bnb1nj68zufj3axulhletk4qut5ztn30fah9nhscg0",
      "bnb1hv30rmjgu0wvtyyrzvm6njs8u2dc5l6aydw3gh",
      "bnb1r4vvasqg7tsh9u4kl68ywskg3rq8juf6f640jz",
      "bnb1agsyvgg2m45p5pef5xaetemhwcp3v84qgprhzq",
      "bnb1hpcfdtv84srdq7n9a7mhnnmd3jwuda97dqzftu",
      "bnb19yhugy8qzps8rur4mnp6tnz8w6nh7qrqz05yj0",
      "bnb1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9rcw5kr"
    ]
  },
  "bitchain": {
    "owners": [
      "1G47mSr3oANXMafVrR8UC4pzV7FEAzo3r9",
      "18AV9vQZYm6yvG1W5JadaHSHR2b2xzujLf",
      "1EkkGXR7dTbZbrKFKoe6YEP4gj4GzMeKvw",
      "1HpED69tpKSaEaWpY3Udt1DtcVcuCUoh2Y",
      "14kmvhQrWrNEHbrSKBySj4qHGjemDtS3SF",
      "162bzZT2hJfv5Gm3ZmWfWfHJjCtMD6rHhw",
      "3HroDXv8hmzKRtaSfBffRgedKpru8fgy6M",
      "1FLKsCiEsABS7LysfDA8R181TQ6eLjoxPv"
    ]
  },
  "bitcoincash": {
    "owners": [
      "1G47mSr3oANXMafVrR8UC4pzV7FEAzo3r9",
      "18AV9vQZYm6yvG1W5JadaHSHR2b2xzujLf",
      "1EkkGXR7dTbZbrKFKoe6YEP4gj4GzMeKvw",
      "1HpED69tpKSaEaWpY3Udt1DtcVcuCUoh2Y",
      "14kmvhQrWrNEHbrSKBySj4qHGjemDtS3SF",
      "162bzZT2hJfv5Gm3ZmWfWfHJjCtMD6rHhw",
      "3HroDXv8hmzKRtaSfBffRgedKpru8fgy6M",
      "1FLKsCiEsABS7LysfDA8R181TQ6eLjoxPv"
    ]
  },
  /*
  "bitgert": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  */
  "bitkub": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "bittensor": {
    "owners": [
      "5CNChyk2fnVgVSZDLAVVFb4QBTMGm6WfuQvseBG6hj8xWzKP",
      "5HgKqPsEz17fBVCvd5cgWbGbapBXCn48p8LHjjvAub2kvVyd",
      "5FsWP1GxpzT11xyFBojKpE75pzp54ESDA6BYbRMPJ2nsCZE5",
      "5GSbmqT4LV2PA3TfxtakZySNkTZ1b3bqPRMo7UbBfZrp6d8k"
    ]
  },
  "bittorrent": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "blast": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "boba": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "bone": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  // "bouncebit": {
  //   "owners": [
  //     "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
  //     "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
  //     "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
  //     "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
  //   ]
  // },
  "bsquared": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "btr": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "callisto": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  /*
  "canto": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  */
  "celestia": {
    "owners": [
      "celestia155svs6sgxe55rnvs6ghprtqu0mh69kehje7a6w",
      "celestia1jm068whkhkxk48gx80ppm2m0nwy677pr85knnx",
      "celestia1xunyznpjmj9jv5e2zwngp2qrzmulr2ggfjswnm",
      "celestia1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9skqgdq"
    ]
  },
  "celo": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "chainx": {
    "owners": [
      "5PwXDxpqSNF8oZN99EFY1PbFURdrsTmiHJ38sYYhdSKw5fjn",
      "5VFeMNx3kas7Vc1rS9NjGPoSsnU7K9KBC1SYy7CmqJDjV5iE",
      "5U1vHpXs74mqUAGbmxLoKmyE3RqbhQrsmJU4LqsnbH3nezDb"
    ]
  },
  "chz": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "clv": {
    "owners": [
      "jHCPYN1HbjjwkKZnLYHYDS5onRwjVHSgTmkU7mDcxQFQ1C3BR",
      "jHHhfVRQp3xZj1cS3qCfQh61yqJZjj8DvgTsXrnH2c7HobQWB",
      "jHFtr32pXtwu4r6CNPvn3zirU5VCHaac12RiniTiEzZ3useUz",
      "jHGTwRrzdQSUSzAgoB1dUkUBkzwwE7PmdFku3EWx3N67rmDRT"
    ]
  },
  "cmp": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "concordium": {
    "owners": [
      "3rzzW6gBVMWXajrh3QLE8aFtmGQbdVFvCmKrcxsYBQxnfywfrR"
    ]
  },
  "conflux": {
    "owners": [
      "cfx:aasusb60hfktf87fx1jg8m4cnnhebrew92f4swayt0",
      "cfx:aase06fdw4cdrsrazhhzebshu9z2ds4zvu8j9zv3ad",
      "cfx:aat80d5bu6rp5redv18g4yec8bv8ssheee8c9zur0a"
    ]
  },
  "core": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "cosmos": {
    "owners": [
      "cosmos155svs6sgxe55rnvs6ghprtqu0mh69kehrn0dqr",
      "cosmos1jm068whkhkxk48gx80ppm2m0nwy677prk78rft",
      "cosmos1hpcfdtv84srdq7n9a7mhnnmd3jwuda970ya92j",
      "cosmos19yhugy8qzps8rur4mnp6tnz8w6nh7qrqqttgnp",
      "cosmos1xunyznpjmj9jv5e2zwngp2qrzmulr2ggccp7fk",
      "cosmos1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9pu3chd",
      "cosmos10v2gu0vvdeuv8pexnl98lmyva4cq8jkaa4845c"
    ]
  },
  "cronos": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0xa4992ccf2a74132936b87cbf28b5d52304ba3be7",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "cube": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "dash": {
    "owners": [
      "XqjxbhVwksb7WXG5iJSh3bWnKSpvEYjG1P",
      "XpSb6n51bAp9knuqBgxKPm4rX4dy3rjSjY",
      "XsW53Lonn2fAPX7QPvnrjXugSqCbDcmBpj",
      "XeSckx4kUZapSYT2B5HfabX575ETHqUX8i",
      "XfiSpp6vf1tWEDMdReptNBy6ZYU3Gbozpo",
      "7iaS3jCJWm5xRf7PvoLAm4eHFNhH3FETUG",
      "Xq2AhTN8psQ2GHaTX6UMGXooHjgLGjFNkp"
    ]
  },
  "defichain": {
    "owners": [
      "8W8yVQDEaQiJ5PB4Hy8CvKj9pBtD3zqkhb",
      "8UqbzUnJQhwLKepomMdqGVHE1ohFpnzjSr",
      "8VRBbA5ReQXCq9VS6m9s9G2AnUjd74nwQn"
    ]
  },
  "doge": {
    "owners": [
      "DLCDJhnh6aGotar6b182jpzbNEyXb3C361",
      "DJtqonMkvsVr8rVr4Pdf5zYfZrnaLSdnwi",
      "DKRg7bL5s1NbWp1VMKhP1gbw6mqydnoX2u",
      "DMxKkM6Y7jLrmahRGdUCRmPVVdMCZh7QKy",
      "D8tsTxMVpGGWpc333my1Gpzt9sP4YQjoDx",
      "DAAhXpPfziaCcGweJMWE4RSucLcee7NcqL",
      "A8c3xNz2mqsDLFwv5KL5fpH12QEwDaoTXo",
      "DKURQTetAa5ieMAUPo9gxmHcLXpwes8kH1"
    ]
  },
  "dydx": {
    "owners": [
      "dydx155svs6sgxe55rnvs6ghprtqu0mh69keh22pfq5",
      "dydx1jm068whkhkxk48gx80ppm2m0nwy677prl8f8fu",
      "dydx1xunyznpjmj9jv5e2zwngp2qrzmulr2gg3p06fp",
      "dydx1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9g9luh6",
      "dydx10v2gu0vvdeuv8pexnl98lmyva4cq8jka5vf350"
    ]
  },
  "dymension": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "edg": {
    "owners": [
      "hp7fFnvDbtF2PPydXhf33kXZULyqgUTJVYH7FkZVoKtfhoD",
      "o8Enfv8XpWDiS3gvSprJ3xixqBEHN1vDCwhCpQdhfDh5EPb",
      "mKRLHKrNoqZYup1VAwVbgoDD1on8pPzZAnx4Vqr66yoMFSJ",
      "mtWj7VwtJQwgzJSGFnvMS8W8UYifdZcnVyCaZ5eTe3kF4Jj"
    ]
  },
  "elastos": {
    "owners": [
      "EKk4HeHnLvMpxFiSbjVizcrCB1nVt39Bwe",
      "EWwQTNN6ehrVLBh4imEYtQr61txBE2ARUk",
      "Eb1wiohh195bcZrsPowoMdNRmaaJk4wbai",
      "EftXuMPJRVxKjFKQ2Z3oiayi5hL4v56u5R",
      "EdGT5d52SZhYASQpMdCydpnv1iiS4j2YoA"
    ]
  },
  "elrond": {
    "owners": [
      "erd1p4vy5n9mlkdys7xczegj398xtyvw2nawz00nnfh4yr7fpjh297cqtsu7lw",
      "erd1lptaaz323qjgsg67mfsa8aquffs9j8tl3khvz2v7creqgf4yeslsf2u99c",
      "erd1cx3a4wu4kpnk0ke2hp0dp05xzvapt0lr4q86q97thqepvas2sxqsnh0533"
    ]
  },
  "elys": {
    "owners": [
      "elys155svs6sgxe55rnvs6ghprtqu0mh69kehrnk2dp",
      "elys1jm068whkhkxk48gx80ppm2m0nwy677prk77yyf",
      "elys1xunyznpjmj9jv5e2zwngp2qrzmulr2ggcccey5",
      "elys1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9pugl60"
    ]
  },
  "energyweb": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "enuls": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "eos": {
    "owners": [
      "gateiowallet",
      "ha2tanbqg4ge",
      "eos32signhw1"
    ]
  },
  "eos_evm": {
    // "owners": [
    //   "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
    //   "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
    //   "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
    //   "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    // ]
  },
  "equilibrium": {
    "owners": [
      "cg3QZnNBPvXUiaAJzXqR1Ria2egcLXgmmRu9wGa2nQk5aV7FP",
      "cg8igunJcEk6hGCxhpkYCginE43SayNKELcZMN8grcbyNtcg9",
      "cg6usTPiL5jS36gj2PUeqzMciJE58pphJgaQcDp8513jVAtc8",
      "cg7UxrDtRbE1REmDTAZWGk6x1Dgp5MdrvuuarjsMsNaoS4eUp"
    ]
  },
  "ergo": {
    "owners": [
      "9iKFBBrryPhBYVGDKHuZQW7SuLfuTdUJtTPzecbQ5pQQzD4VykC",
      "9gQYrh6yubA4z55u4TtsacKnaEteBEdnY4W2r5BLcFZXcQoQDcq",
      "9f5WpnpDCAWHXk4HYARp7NKBJV58QSkCKAC2vucsaVBjPgKsght"
    ]
  },
  "ethereumclassic": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0x246a2ecd9626f9eda55fffbff5216ed417a904f5",
      "0x840760aed6bbd878c46c5850d3af0a61afcd09c8",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0x4bbe1961bd0a6cd1fe3cd8947be15bd8ae2ee562",
      "0xd793281182a0e3e023116004778f45c29fc14f19",
      "0x35b31ae2604dd81d9456205025ea02418dba8242",
      "0x354e0184a6a6e634ccb07388e2617e05e427563c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  // "ethf": {
  //   "owners": [
  //     "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
  //     "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
  //     "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
  //     "0x54c82d26624e85000d1387ee7c9580c3c6d7b5b7",
  //     "0x7750fe679d47a9e00575ad46043297a234e83fa2",
  //     "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
  //     "0xd793281182a0e3e023116004778f45c29fc14f19",
  //     "0x354e0184a6a6e634ccb07388e2617e05e427563c"
  //   ]
  // },
  "etlk": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "etn": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "evmos": {
    "owners": [
      "evmos1p5rs093e2te0hfva6phjksj6eeqtfyh7ma0cjz",
      "evmos1r39hpgukssmtng9feafqt3u8awqmk4vv7vvwtl",
      "evmos1ezptzyd8tsxx2l79qlqyl07d9nycfur36wpmyf",
      "evmos1ll4s7cv8rtxmfqudl3k4pqhsv0nn3eppwgmrq9"
    ]
  },
  "filecoin": {
    "owners": [
      "f1d7mq36vf6osdhcd32i6k3wyb223mdjlxnafnala",
      "f1z7izlq5yv2wkrt6ks4fnzscesnd6kntt6vovqai",
      "f1pbcpx47wwpb5za2stdz3skfcplmk6zxi7hwv3sy"
    ]
  },
  "findora": {
    "owners": [
      "fra1p4vy5n9mlkdys7xczegj398xtyvw2nawz00nnfh4yr7fpjh297cqsxfv7v",
      "fra1lptaaz323qjgsg67mfsa8aquffs9j8tl3khvz2v7creqgf4yeslsjufhy6",
      "fra1cx3a4wu4kpnk0ke2hp0dp05xzvapt0lr4q86q97thqepvas2sxqsgp6xsn"
    ]
  },
  "flare": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "flow": {
    "owners": [
      "0xb65cb9286d8eab6c",
      "0x4f45575f29f5dffb",
      "0xa008dc1bf48aa10d"
    ]
  },
  "ftn": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "fuel": {
    "owners": [
      "0x778c29331c90bc9d986dd790c6ed7225e1b9d0857952d4be81e91f0dfbc57a2e",
      "0x188f36048cd9353bdd3809e349d20deab4cacad709d7cce64f2a417e55d27ec5",
      "0xdd8861e6d56cfde6c3a017e246e0ff26d29ff30d08eef4e927d221a6a0b765c1"
    ]
  },
  "fuse": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "fusion": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "gochain": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "harmony": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0x246a2ecd9626f9eda55fffbff5216ed417a904f5",
      "0x840760aed6bbd878c46c5850d3af0a61afcd09c8",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "heco": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "heiko": {
    "owners": [
      "hJFVeb7Z8zaQSPwjw8x6rRySFtxzk4KJrUCGs1pk71CQGyqd1",
      "hJLomiXgMJo2R5zPeRsE3gyeTJKpzVzrKNugH7PQBD4J5NwfD",
      "hJKa3eyGAfGw94YePmgC7kMpETyCUtGQ1xChnV85By388Z6px"
    ]
  },
  "hpb": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "hydra": {
    "owners": [
      "HMaF9nmaCNua4vExqCTDb5iTfHYxdL6K8q",
      "HLGsesLe2g8cKBtiJaxqwFGXruN1QGJji2",
      "HLrTFYdmGNiUpgZLdzUsp21UdaQNh7E8Tb"
    ]
  },
  "hyperliquid": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "icon": {
    "owners": [
      "hx548ad28ef8d6caed7f27f6001fb7a654ad8cca40",
      "hx5130e85046609cda7c6f579c09946bcf6c86d81b",
      "hx46a0528308c53c8d3e40f17b08f2c3fcfafb94d6",
      "hxce12bc670be0e35dbb6ffb8935648d87fbd74154",
      "hxffd3f84a64d2673b8b7564dd5307d16624553a3e"
    ]
  },
  "icp": {
    "owners": [
      "8fe706db7b08f957a15199e07761039a7718937aabcc0fe48bc380a4daf9afb0",
      "8f079b740ca593e6741e8a552f06352d0e6c844f6fd75533e3bd575ec76cb147",
      "6463450788218283a2959d7cf4e1bfbaf422753e5c4596b593ed9d3f4cf20497"
    ]
  },
  "injective": {
    "owners": [
      "inj155svs6sgxe55rnvs6ghprtqu0mh69kehf6cfjm",
      "inj1s52g6m4h96lxyug2hejrqs6ffu26cuf5ym5mgq",
      "inj1jm068whkhkxk48gx80ppm2m0nwy677pruhs8mn",
      "inj1xunyznpjmj9jv5e2zwngp2qrzmulr2ggj3k6mw",
      "inj1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9t4xu94",
      "inj10v2gu0vvdeuv8pexnl98lmyva4cq8jkahus3xq"
    ]
  },
  "interlay": {
    "owners": [
      "wd7oNzH5QHFCkwjRmAKXdkjyhcRmJ5QX1CTLB4M2FZSkcUFEd",
      "wdD7W7hCcbTpjdn5UTEeq1kBu1nbYX64U7Ajb9ugKmJeQsYz5",
      "wdBJgfJcLSTA5UFqo1xmUKP2PFyE6NYSYT8ar1b7Y9kQX9o1v",
      "wdBsn48nRwwjTcLLDo3cu58MgBRy2uMcAgTm6XeMLXHUU3aH7"
    ]
  },
  "iotex": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0x246a2ecd9626f9eda55fffbff5216ed417a904f5",
      "0x840760aed6bbd878c46c5850d3af0a61afcd09c8",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "islm": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "kadena": {
    "owners": [
      "k:0d584a4cbbfd9a4878d816512894e65918e54fae13df39a6f520fc90caea2fb0",
      "k:f857de8a2a882488235eda61d3f41c4a60591d7f8daec1299ec0f20426a4cc3f",
      "k:c1a3dabb95b06767db2ab85ed0be86133a15bfe3a80fa017cbb83216760a8181"
    ]
  },
  "kardia": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "karura": {
    "owners": [
      "obmvFLKbtkyBSoSY4agQx1xCxVGts6yVS6QiwPrxevNxE7f",
      "tuu3fTXv7NwsVT9pyhsfxE9cKKXLYeSQ9VppW3wAWpBMM7B",
      "s75bGsFm6iHhyDUPhpWyb4drVx5C12Wk7M5gBV9YxaHdova",
      "sgAz73MGbHfr3huAnfwjLPvmxh1ipC8ySXLCEiwvVeEXeBn"
    ]
  },
  "kava": {
    "owners": [
      "kava155svs6sgxe55rnvs6ghprtqu0mh69kehlxmsky",
      "kava1jm068whkhkxk48gx80ppm2m0nwy677pr2tn7lv",
      "kava1hpcfdtv84srdq7n9a7mhnnmd3jwuda97n3fcu4",
      "kava19yhugy8qzps8rur4mnp6tnz8w6nh7qrqu7l49x",
      "kava1xunyznpjmj9jv5e2zwngp2qrzmulr2ggyd4rl3",
      "kava1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9af99p2"
    ]
  },
  "kintsugi": {
    "owners": [
      "a3aWepSsLfy67vUAAaKCiSnCj7G72feeTCgfKCBLivBWWTdFW",
      "a3fpmwrzYzBi6cWossEKuhnQvWcwH7LBv7Q4jHjzo83QJs1ys",
      "a3e1xVUQGqB3SSzaCRxSZ1RFQkoZpxnZzTMuz9RS1WVAR9BBL",
      "a3eb3tJaNLfcpb54dD3HymAahgGJmVbjcgh6EfUfot2EN2oJB"
    ]
  },
  "klaytn": {
    "owners": [
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "kroma": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "kusuma": {
    "owners": [
      "CspNJ5uJ9WcF6Nf6sJY9YRQL3dWZmKrMnmd2qY4BXMTGEgi",
      "JBwViD7cN8aw92NPnRjQYdbjQTm1SsKGWB38QC8PPFFfLuc",
      "DdCg75U3jH69QL1jDG7WybLxk9KLWM1gokBay77qng6dbhT",
      "GP83KcqTMTvmcngxWYNiBU5yb6JruFPcU2Hz5dLmq1MwqGs",
      "GxDS9nvxr3JuhH7jbPoTvoNu3qFPiR1qoCYW8s99N5JqhT5",
      "GS988ESnKUHMYixhAZJLJjQkpBEGRN3AdEJbY7CXxauxoQo",
      "J5VsgNemdBg2bfvHresAtBZdxE67WrS656Caup3MgsBE2y7",
      "ErJ8h2WUY35Eb1cDMTCZgnht2kT2gKdKeNnw21tDDmRxSXL",
      "HfQVohDHuXHr1Y9y3fZdNNANKhMHn4ndcVXaCN3rWW94hN7"
    ]
  },
  "linea": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "lisk": {
    "owners": [
      "lskqov47at3sqaaf9bg38kymku92rcdax7refhpk3",
      "lsko9dq4zcp7yu5fvr2owm672sxdpc5swapv3dbyk",
      "lskwqe5qassrz55474rux63537nwasf53va79hczs"
    ]
  },
  "lukso": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "manta_atlantic": {
    "owners": [
      "dfWrWfp3dJ7FNXyLCEW8gvmknvAyi9FTa5gFZeGUD7GaSbUXa",
      "dfcAdoEAqcKsME1yuXRFtBmxzKXoxaw12zPeyjq8HK8UEzgZ6",
      "dfaMpLqaZTKCh4VkE69NXVQoUZiSWSPP7LMWEbWZVhaEMH5hW",
      "dfavujfkexon5CaEesEDxFA8mVBBSyCYjZggV7ZoJ57JJAbVb"
    ]
  },
  "matchain": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "merlin": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "meter": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "metis": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "mode": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "moonbeam": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "moonriver": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "naka": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "near": {
    "owners": [
      "0d584a4cbbfd9a4878d816512894e65918e54fae13df39a6f520fc90caea2fb0",
      "f857de8a2a882488235eda61d3f41c4a60591d7f8daec1299ec0f20426a4cc3f",
      "c1a3dabb95b06767db2ab85ed0be86133a15bfe3a80fa017cbb83216760a8181"
    ]
  },
  "neo": {
    "owners": [
      "AJN2SZJuF7j4mvKaMYAY9N8KsyD4j1fNdf",
      "AVZNcHPDYuDj9rJCUZuN3A8DirNk8QPBEr",
      "AZdusiiouLSqSEU19cccWNeZUXzsZEk2UB",
      "AeWW4GQRKhKZYuvXnMicsLFqnekdpSofk6",
      "AbtREY69Lm4mz71x7Rsnna53ig8zzXRrXK"
    ]
  },
  "neo3": {
    "owners": [
      "NTWC7Hh5VYMQ5K8YJbyCLbmJ4RhfQ1Ej64",
      "NY8VmiQ8if23Cr7Fe6xwXZ4a59JTVXHDCN",
      "NcSZPD4ToU3v1C8NPK13hibCnZcPEqHD1a"
    ]
  },
  "neon_evm": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "neutron": {
    "owners": [
      "neutron155svs6sgxe55rnvs6ghprtqu0mh69keh8vx06y",
      "neutron1jm068whkhkxk48gx80ppm2m0nwy677prjpwpnv",
      "neutron1xunyznpjmj9jv5e2zwngp2qrzmulr2ggu8gun3",
      "neutron1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn99rc6d2"
    ]
  },
  "nibiru": {
    "owners": [
      "nibi155svs6sgxe55rnvs6ghprtqu0mh69keh5kt5fs",
      "nibi1jm068whkhkxk48gx80ppm2m0nwy677prpmr6qc",
      "nibi1xunyznpjmj9jv5e2zwngp2qrzmulr2gg0a98q9",
      "nibi1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9ke4p77"
    ]
  },
  "nuls": {
    "owners": [
      "NULSd6Hge2GxNKwYRxxvnQynMK2gKt5YAVANR",
      "NULSd6Hgd9SJyzE6cmFmPQQ6VcpcQPLvbM4K2",
      "NULSd6HgdY5zjfxhHhQMyGnJmxZREDxr8Zhh1"
    ]
  },
  "oas": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "oasis": {
    "owners": [
      "oasis1qppfyeugxmxdx5m4gpasg4xqg296zcdndy0k2zsg",
      "oasis1qqz86qv538ff9y4exy6g3j724mq68wj7pu55rgwt",
      "oasis1qp8f5gh8zgad5t47hc40ayw37ptcszrtsq6eh5de"
    ]
  },
  "okexchain": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "ontology": {
    "owners": [
      "AJN2SZJuF7j4mvKaMYAY9N8KsyD4j1fNdf",
      "AVZNcHPDYuDj9rJCUZuN3A8DirNk8QPBEr",
      "AWGrHN1DUAo6Ao3yTHu4tUHZonPNAy9ZmU",
      "AM1te97HdmaereEMgtLg7YvfUP624Ra4iF",
      "ASPPqj8yCcCV2sWHQZwsYfWZS2FMfd3PF7",
      "AZdusiiouLSqSEU19cccWNeZUXzsZEk2UB",
      "AeWW4GQRKhKZYuvXnMicsLFqnekdpSofk6",
      "AbtREY69Lm4mz71x7Rsnna53ig8zzXRrXK"
    ]
  },
  "op_bnb": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  // "orai": {
  //   "owners": [
  //     "orai155svs6sgxe55rnvs6ghprtqu0mh69kehsqewps",
  //     "orai1jm068whkhkxk48gx80ppm2m0nwy677pr9d3qgc",
  //     "orai1xunyznpjmj9jv5e2zwngp2qrzmulr2ggtthag9",
  //     "orai1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9j08mk7"
  //   ]
  // },
  "osmosis": {
    "owners": [
      "osmo155svs6sgxe55rnvs6ghprtqu0mh69kehtguak3",
      "osmo1jm068whkhkxk48gx80ppm2m0nwy677pr795nle",
      "osmo1xunyznpjmj9jv5e2zwngp2qrzmulr2ggsrjwly",
      "osmo1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9f8zgpl"
    ]
  },
  "parallel": {
    "owners": [
      "DVhKTLv9mkh42BZRKJTmWRjlT64T3zmm9SD8kMrqL7A",
      "-FfeiiqIJIgjXtph0_QcSmBZHX-NrsEpnsDyBCakzD8",
      "waPau5WwZ2fbKrhe0L6GEzoVv-OoD6AXy7gyFnYKgYE"
    ]
  },
  /*
  "persistence": {
    "owners": [
      "persistence155svs6sgxe55rnvs6ghprtqu0mh69kehdlf7w8",
      "persistence1jm068whkhkxk48gx80ppm2m0nwy677prcjps80",
      "persistence1xunyznpjmj9jv5e2zwngp2qrzmulr2ggk58d8j",
      "persistence1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn90shtef"
    ]
  },
  */
  "pokt": {
    "owners": [
      "ab04976668dd739f34df43e912d20dc487ac85d2",
      "63755480647460bf0a5865caa76361d106bddf24",
      "bd6cbae77b9016b4b932805485a1c7be77e5a059"
    ]
  },
  "polkadex": {
    "owners": [
      "esm4teFDTrvy4VJ8msKTQmAywumeinGjzsrFzmTEB5FBiiekE",
      "esrP1mfLgB9b3BLnVAEac2BC9K8UyDxHTnZfQs1tFH75X81FT",
      "espaCKGkQ28vP1pYoixhFKp2dZK7X5QfY8XWfihKTfYqdQFGd",
      "esq9Hi6vVXdVm9u3EW3Yg5ZMvUmrTcDqAMrgvEkZG35uaJ6tp"
    ]
  },
  "polygon_zkevm": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "proton": {
    "owners": [
      "gatedeposit",
      "gateiocold"
    ]
  },
  "radixdlt": {
    "owners": [
      "account_rdx16y5vw2latcyn7h2leujsc0th2junpgxnafx0aqrher4yw7pmnmfyx8",
      "account_rdx16xkm9wvwcwq0q8ly6hm6m86s90zcqxeexhnzn8l9jkgtk3t8z7j2yz",
      "account_rdx169r653rp86kepz28wrzlxzy6ll2use5jmew5rz9h24uyj9cjqtl38n"
    ]
  },
  "reef": {
    "owners": [
      "5CNChyk2fnVgVSZDLAVVFb4QBTMGm6WfuQvseBG6hj8xWzKP",
      "5HgKqPsEz17fBVCvd5cgWbGbapBXCn48p8LHjjvAub2kvVyd",
      "5FsWP1GxpzT11xyFBojKpE75pzp54ESDA6BYbRMPJ2nsCZE5",
      "5GSbmqT4LV2PA3TfxtakZySNkTZ1b3bqPRMo7UbBfZrp6d8k"
    ]
  },
  "rei": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "rollux": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "ronin": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "rsk": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "rvn": {
    "owners": [
      "RQLJqxjLPzB6Rb2hKb7bHbACFNhpq11zhv",
      "RP2wM3JQEHQ8frgSnydDdkiGSzWscgUihs",
      "RS6RHc3BR9F9Jat21DTkyXZ6Nm5VrLUKxt",
      "RD2y1DJ97gAoMcDdnMxZpbAV317MvAuu8A",
      "REJo55LKJ8UV9H8F2wVncBcWVULwtsoiKn",
      "RPcWwibXTyz1BMM58P9FWXTDDfZExE78SG"
    ]
  },
  "secret": {
    "owners": [
      "secret155svs6sgxe55rnvs6ghprtqu0mh69kehpkmyal",
      "secret1jm068whkhkxk48gx80ppm2m0nwy677pr5mn25h",
      "secret1xunyznpjmj9jv5e2zwngp2qrzmulr2gg6a4h52",
      "secret1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9re9323"
    ]
  },
  "shibarium": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "shiden": {
    "owners": [
      "WEo9Gi7T28niGb3pTwcHFDgGW4PjKDQvcS1stTxa68v73nQ",
      "bYvGgqKmEkmQKEm7P4oYFRsfrteAzksqKqRyT82mx2iWSZt",
      "Zk6pJF3cE67Eo15g7BSqtGMv3XC2T8xBHggq8ZFAPnpnpnY",
      "aKCD8R97ifVNsVWTC2sbdbeqWG8ZGJaQcrwMBo3XvrmgR4N"
    ]
  },
  "songbird": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "sora": {
    "owners": [
      "cnRnnKrqCX9TEZvCgVuiXbPbE1jmA3R55W6cLeKC43U8nVoma",
      "cnX6uTGxQqN5DFxrPnpqirPoRR6bQV6cYQp1kjsr8FL2au8KM",
      "cnVJ5ztN8gMQZ6SciMYxNA2dufHDxLYzckms1bZHLdmnhBbm7",
      "cnVsBPiYEBqywEX798donumyCajxtsNAEz73G7cX91Jre5TfS"
    ]
  },
  "stafi": {
    "owners": [
      "313h29qADPFh49f1QT8xwmD3xnCoZ4fDkijz797UWv4EKqmx",
      "36Mp9ZxNXbsfkCJihNGACmRFN933zkCgfS9QChmYimx2jPEb",
      "34YzhBN6NbD1ag53G6NoWQFjcKfbrCam1Pzf4PCm7Di91dtJ",
      "358661YBt5nPikZU3BEEG9b2XnQYP1kPEjAuaSSZUkn5uMJq"
    ]
  },
  "starcoin": {
    "owners": [
      "0x5aeae9cbf49070dc93aed2f16b99012a",
      "0xd126d715c5df145eee58f4f4f6217898",
      "0xc2cb026e3e9b55a6613c10cc90904a40"
    ]
  },
  "stellar": {
    "owners": [
      "GBC6NRTTQLRCABQHIR5J4R4YDJWFWRAO4ZRQIM2SVI5GSIZ2HZ42RINW",
      "GBJ746LVE2LFZ5OA2QEQUE35QHHI3OXZ75RH4USXY2GBFAKCBKQG3HKU",
      "GCLP5OZ4SFU4X2MD4BGZKC7FFJY3NGM3Y6TVULOWLUNNWHEFNUJGAW5Y",
      "GCE2HXJTGSI66KBPEVQYFU7N4KWAGRIG4TJPZTPWRGVSH2MZCC4EAY63",
      "GBOL3FQURYYBAPWMAGMY5IS3ZFQRYOLBANZTVGGFL5MAN545QB5NAEUT"
    ]
  },
  "sui": {
    "owners": [
      "0x62f36b79d7ea8ae189491854edd9318b29c75346792177b230a95f333ffa53ad",
      "0x7ce04f66dca33c786c7375f73c4f7459e16b8a80cbbdd055e3782b3e176fa3d3",
      "0x019b848f4511b354c314a4e5c1a40dbc247fe5d29c6bcb3495badb01751d549a"
    ]
  },
  "syscoin": {
    "owners": [
      "ScM7oHdCXXZistSxPr7YjxyZ8tUf3HG8c2",
      "Sb3kJNCGMpnm8A6hsEdB68XdLWHhkXietE",
      "SSKc2QEBRfs7baYW7CVk4ZRsNz7n28P2j3",
      "SbdKu3VPbXNddemLCe9CxuGa7BL538hBCx"
    ]
  },
  "tara": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "telos": {
    "owners": [
      "gateioiotlos"
    ]
  },
  "tenet": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "terra": {
    "owners": [
      "terra155svs6sgxe55rnvs6ghprtqu0mh69keh9h4dzr",
      "terra1f62zqvvm6y2vlp6rhn94k9spsuqmh727twq8e4",
      "terra1jm068whkhkxk48gx80ppm2m0nwy677prs6artt",
      "terra1xunyznpjmj9jv5e2zwngp2qrzmulr2gg7um7tk",
      "terra1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn98ctc4d"
    ]
  },
  "tezos": {
    "owners": [
      "tz1hjem5Rpf4KAVbwMLJet75TDb8HjAKnTYk",
      "KT18yTsDxUbVrenxZsbFSx6Ai72hRHod9pHV",
      "tz1RRVLD5LEu8iaoTMGc5L1NiyiEGuSUtAwX",
      "KT1PuUGWvCypTrNu7yweWCzpX6zyuy6nq6Wu",
      "tz1fw6VKhBZ8N7HAvCwvXSkTvQ7YcUk3w9AK"
    ]
  },
  "theta": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0x246a2ecd9626f9eda55fffbff5216ed417a904f5",
      "0x840760aed6bbd878c46c5850d3af0a61afcd09c8",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "thorchain": {
    "owners": [
      "thor155svs6sgxe55rnvs6ghprtqu0mh69keh95kk4u",
      "thor1jm068whkhkxk48gx80ppm2m0nwy677prse7cu5",
      "thor1xunyznpjmj9jv5e2zwngp2qrzmulr2gg7lc9uf",
      "thor1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn98mgrzj"
    ]
  },
  "thundercore": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "tomochain": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0x246a2ecd9626f9eda55fffbff5216ed417a904f5",
      "0x840760aed6bbd878c46c5850d3af0a61afcd09c8",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "ton": {
    "owners": [
      "0:3addd84bf73267312a477049fd9b8db761bf39c585c150f8e6f9451347af2b6c",
      "0:09c592c5b17a555c1ace781f38303e5a115978f57cf22773b280d14028e7dd92",
      "0:16ea6a34f0d704b6fac9b7592e003f6f28ae5d1a8a6ba9d1650e4dd30ab8eada"
    ]
  },
  "umee": {
    "owners": [
      "umee155svs6sgxe55rnvs6ghprtqu0mh69keh39jjy3",
      "umee1jm068whkhkxk48gx80ppm2m0nwy677pryg6ude",
      "umee1xunyznpjmj9jv5e2zwngp2qrzmulr2gg2wupdy",
      "umee1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9n2v8nl"
    ]
  },
  "vana": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "vechain": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0x246a2ecd9626f9eda55fffbff5216ed417a904f5",
      "0x840760aed6bbd878c46c5850d3af0a61afcd09c8",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "velas": {
    "owners": [
      "u6PJ8DtQuPFnfmwHbGFULQ4u4EgjDiyYKjVEsynXq2w",
      "HiRpdAZifEsZGdzQ5Xo5wcnaH3D2Jj9SoNsUzcYNK78J",
      "E2tbmDk29G6jHdrgwHC6kXGFfDsyrXUyWjD3e3ZB4oNp"
    ]
  },
  "venom": {
    "owners": [
      "0:9f4fb4d07e97542c2200672b2819c1c3987c48a353c655858ba525c7e51bbfc7",
      "0:595972816072851da891322300897c5e71255d2f2dbd1ca721568b6ac1e761db",
      "0:c6c2f45369f7a281ed9771fcb2dc62863a2625e963074159af527169e470de29"
    ]
  },
  "vinu": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "vite": {
    "owners": [
      "vite_f262f48ec1097880c83aa079dfb0baef5e68c4ff6c0b807b0a"
    ]
  },
  "waves": {
    "owners": [
      "3P7LZSuVDv5pQS7NSCE1LyGCbQihzk1fQ2r",
      "3PJL6FBmbQrYpvtWjRJEETAF7ngZ1cB4Hcj",
      "3PMb9uuJm5VB9VUzNLhZGScEK8m7zGwDED3"
    ]
  },
  "wax": {
    "owners": [
      "gateioiowaxp"
    ]
  },
  "wemix": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "xdc": {
    "owners": [
      "0x0D0707963952f2fBA59dD06f2b425ace40b492Fe",
      "0x1C4b70a3968436B9A0a9cf5205c787eb81Bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "xlayer": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "xpla": {
    "owners": [
      "xpla155svs6sgxe55rnvs6ghprtqu0mh69keha5h3ts",
      "xpla1jm068whkhkxk48gx80ppm2m0nwy677prgellzc",
      "xpla1xunyznpjmj9jv5e2zwngp2qrzmulr2ggxlezz9",
      "xpla1n5ukn9q2r5vrgt6su0e6cvm5lyxe2cn9lmfyu7"
    ]
  },
  "zeta": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421",
      "0xcf6f5ec73942314c3ec864202b40dcbb1f9477a0"
    ]
  },
  "zilliqa": {
    "owners": [
      "zil1e9k0rdjgh0khx06veut6ghwkggue6snmrlyg4w",
      "zil1melkmjzv6v784dlk30rhx2ck4zccqpprsdd3jt",
      "zil12zn46cppzsg0thgn7e66ugjd3c25hcl0acjaud",
      "zil1jcmadzrm6w49gegqw94esdkyhfq75y4fxl9wrv",
      "zil12acrew80f00m4v3cs4hw9yawx7m74fwdwtmdj5"
    ]
  },
  "zircuit": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "zkfair": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x6596da8b65995d5feacff8c2936f0b7a2051b0d0",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
  "zklink": {
    "owners": [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x85faa6c1f2450b9caea300838981c2e6e120c35c",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xffeb0f61871acdb4838dfc6d5082f063e738e421"
    ]
  },
};

const unsupportedChains = ['aeternity', 'beam', 'binance', 'bitchain', 'bitcoincash', 'bittensor', 'bone', 'callisto', 'chainx', 'clv', 'concordium', 'conflux', 'cmp', 'dash', 'cube', 'defichain', 'edg', 'elastos', 'elys', 'equilibrium', 'evmos', 'filecoin', 'findora', 'flow', 'fusion', 'heiko', 'hydra', 'hyperliquid', 'icon', 'icp', 'interlay', 'kadena', 'karura', 'kava', 'kintsugi', 'kusuma', 'manta_atlantic', 'lisk', 'neo', 'neo3', 'near', 'nibiru', 'nuls', 'ontology', 'oasis', 'parallel', 'pokt', 'polkadex', 'proton', 'reef', 'rvn', 'shiden', 'sora', 'stafi', 'starcoin', 'syscoin', 'stellar', 'telos', 'thorchain', 'velas', 'venom', 'vite', 'waves', 'wax', 'zilliqa', 'secret', 'etn', 'tara', 'zkfair',
  'vinu', 'rollux', 'syscoin', 'aelf', 'ailayer', 'heco', 'archway',
  'ton', // never had any tvl
]

unsupportedChains.forEach(chain => delete config[chain]);

module.exports = mergeExports([
  cexExports(config),
  { ethereum: { tvl: getStakedEthTVL({ withdrawalAddresses: ['0x287a66c7d9cba7504e90fa638911d74c4dc6a147', '0xbcf03ce48091e6b820a7c33e166e5d0109d8e712', '0x7a3f9b7120386249528c93e5eb373b78e54d5ba9'], sleepTime: 20_000, size: 200, proxy: true }) } },
]);
