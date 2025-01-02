const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  ethereum: {
    owners: [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0x234ee9e35f8e9749a002fc42970d570db716453b",
      //'0x925206b8a707096Ed26ae47C84747fE0bb734F59', //this should never be here, its the WBT token wallet
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0x246a2ecd9626f9eda55fffbff5216ed417a904f5",
      "0x840760aed6bbd878c46c5850d3af0a61afcd09c8",
      "0x35b31ae2604dd81d9456205025ea02418dba8242",
      "0xd87C8e083AECc5405B0107c90D8E0C7F70996B84",
      "0x60618B3c6E3164c4a72d352Bde263A5D15f9F7eE",
    ],
  },
  avax: {
    owners: [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
    ],
  },
  arbitrum: {
    owners: [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
    ],
  },
  polygon: {
    owners: [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
    ],
  },
  fantom: {
    owners: [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
    ],
  },
  bsc: {
    owners: [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
    ],
  },
  optimism: {
    owners: [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
    ],
  },
  era: {
    owners: [
      "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
      "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
      "0x234ee9e35f8e9749a002fc42970d570db716453b",
      //   '0x925206b8a707096Ed26ae47C84747fE0bb734F59',
      "0xD793281182A0e3E023116004778F45c29fc14F19",
      "0xc882b111a75c0c657fc507c04fbfcd2cc984f071",
      "0x85FAa6C1F2450b9caEA300838981C2e6E120C35c",
      "0xeb01f8cdae433e7b55023ff0b2da44c4c712dce2",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.gateIo,
  },
  tron: {
    owners: [
      "TBA6CypYJizwA9XdC7Ubgc5F1bxrQ7SqPt",
      "TCYpJ6MMzd9ytoUvD82HnS58iV75QimPh6",
      "TDHkXgDHEiK5WhaKTccJenZKRyUMTxoREx",
      "TN1K2zNVA399AHbp51yyPPfjaD9JNLfQpo",
      "TUt2HuZFZvXAMmF9uh7BqujvMXsZ4F1pif",
    ],
  },
  cardano: {
    owners: [
      "DdzFFzCqrhseMuShaXzLDGDBa8jGEjdEjNc83jouqdqBQzk5R52MedutUq3QGdMPiauR5SjbttqdBjDA5g6rf3H6LjpvK3dFsf8yZ6qo",
      "DdzFFzCqrhtBatWqyFge4w6M6VLgNUwRHiXTAg3xfQCUdTcjJxSrPHVZJBsQprUEc5pRhgMWQaGciTssoZVwrSKmG1fneZ1AeCtLgs5Y",
    ],
  },
  solana: {
    owners: [
      "u6PJ8DtQuPFnfmwHbGFULQ4u4EgjDiyYKjVEsynXq2w",
      "HiRpdAZifEsZGdzQ5Xo5wcnaH3D2Jj9SoNsUzcYNK78J",
      "CLNEVwuSAiGsvPtE74yLhda4beNfd8qfZXVKkUcAJZDL",
      "CVMV7614DjSjY114GwHhG1HNFXofceziDpuGz7VjDD5K",
      "G9XFfWz6adb9wFDKN2v7HfmJDgAc2hirrTwBmca4w26C",
    ],
  },
  ripple: {
    owners: [
      "rHcFoo6a9qT5NHiVn1THQRhsEGcxtYCV4d",
      "rLzxZuZuAHM7k3FzfmhGkXVwScM4QSxoY7",
      "rNnWmrc1EtNRe5SEQEs9pFibcjhpvAiVKF",
      "rNu9U5sSouNoFunHp9e9trsLV6pvsSf54z",
    ],
  },
  starknet: {
    owners: [
      "0x00e91830f84747f37692127b20d4e4f9b96482b1007592fee1d7c0136ee60e6d",
    ],
  },
  algorand: {
    owners: [
      "BVMEUTF37WNEQ6GYCZISRFHGLEMOKT5OCPPTTJXVED6JBSXKF6YJJRZRI4",
      "7BL55CRKRASIQI263JQ5H5A4JJQFSHL7RWXMCKM6YDZAIJVEZQ76SXF2S4",
    ],
  },
  base: {
    owners: ["0xc882b111a75c0c657fc507c04fbfcd2cc984f071"],
  },
  litecoin: {
    owners: [
      "LaH52f9sspcacPMf2Z7mU5tkhKcWJxvAgA",
      "LYyhXjiwi7qcrf1QVwdPpFSptwRZ8L8PuW",
      "Lc3BUJTitygdVPCyiBTwA2HephzBKnHPaH",
      "LNyjBuigbWcHYQYbVKxk15u3Ux23QvEnS9",
      "LQFZFmkrmxuyL5TCjuVxngM4wRFdM2a9EW",
      "MQ4wXRL6etqkEPrLm4f1FKu2eXTM7EMgXo",
    ],
  },
  manta: {
    owners: ["0xc882b111a75c0c657fc507c04fbfcd2cc984f071"],
  },
  mantle: {
    owners: ["0xc882b111a75c0c657fc507c04fbfcd2cc984f071"],
  },
  polkadot: {
    owners: [
      "1JVrK16XZm9vyZjHoYVPjtZ35LvTQ4oyufMoUFTFpAUhath",
      "16ccyj8JqnP8d2DSaifgek6kSSBAu5cGtd4mu2uXTg4H6mSU",
      "14ooXLY2gmiUTVym9SnKxNwEgcoikXzMEav2kiLjr7pPPHPR",
      "1665ypcQXKmqXtjE9yuWsZqK5MQmBQokFjPGLq5SvoKAWBjQ",
    ],
  },
  scroll: {
    owners: ["0xc882b111a75c0c657fc507c04fbfcd2cc984f071"],
  },
  sei: {
    owners: ["sei1xunyznpjmj9jv5e2zwngp2qrzmulr2gg45sg0h"],
  },
  stacks: {
    owners: [
      "SP33XEHK2SXXH625VG6W6665WBBPX1ENQVKNEYCYY",
      "SP15R31KXD5C0N9ESSG7B28M3DP6ZQE2GSED759B3",
    ],
  },
  taiko: {
    owners: ["0xc882b111a75c0c657fc507c04fbfcd2cc984f071"],
  },
};

module.exports = cexExports(config);
