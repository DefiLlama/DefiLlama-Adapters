const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  bitcoin: {
    owners: bitcoinAddressBook.blofinCex,
  },
  bsc: {
    owners: [
      "0x1cA5aa5b1dd8D948bB0971A5fB1762FE172E0040",
      "0xdBdf80D997cFAaAC6150cD0cEC2C127fDaD7A823",
      "0xe5e6c3ced4670697b7cB27a53649a3ED321c18ee",
    ],
  },
  ethereum: {
    owners: [
      "0x1cA5aa5b1dd8D948bB0971A5fB1762FE172E0040",
      "0xe5e6c3ced4670697b7cB27a53649a3ED321c18ee",
      "0xdBdf80D997cFAaAC6150cD0cEC2C127fDaD7A823",
      "0x88C984990573d385949deB571ed21eaD63301045",
      "0xD775Ad8d9B9130B5D609Dc065BD548E46A6610b6",
      "0xFFE011d9B70f616B424E820aA36deba198D947c7",
      "0x9FBED2f9b8407a5B48D2106586Bb9824e32F3507",
      "0x3B463Ee8099f7f65E852524dD316d80375172D54",
      "0xfE56f42E2aC6eccf76488F373771eff859F460d1",
    ],
  },
  solana: {
    owners: [
      "94xmX5J92nZLanLvRstmxhgiS8kN8SVfFQ2zPKYB3Ynb",
      "E3Gd8Hd1yKdkHTQnbenNVBgV2p1MrrenQnVU4SkJD4zx",
      "3oWiTmU5QpTbSuTCVULybWsXc3DVxixdABxJPerLgTai",
      "94xmX5J92nZLanLvRstmxhgiS8kN8SVfFQ2zPKYB3Ynb",
      "3V11R3pEGSt5XeRaoLDcCdkAB8zVSaKRCm8y3uKBgnsr",
      "DTLR1QKfH3QWLDm3wkRZqxiH1NQSH4szWxTjGqHCQQSa",
      "G2dBDN1k6EJdSQNTSeSZ9smwYkFhEgsNNG3mtRE1PVXb",
    ],
  },
  optimism: {
    owners: ["0x1cA5aa5b1dd8D948bB0971A5fB1762FE172E0040"],
  },
  arbitrum: {
    owners: ["0x1cA5aa5b1dd8D948bB0971A5fB1762FE172E0040"],
  },
  tron: {
    owners: [
      "TDFHcjw2PiDLjoqxXedaSSEtA1osqu8J6c",
      "TE4uQTkFMcjm7UVYeQCgTHuec1pFP5J4Ds",
      "TRzpEdrAwHXPQYWvXHJArpcac2WV3gXMr3",
      "TVNRJgNsVMjDPethVVToz9aSvZq9SVgDXv",
      "THTGgHWFXwgaZEDdaQmR6iuUEa7NKfCUtH",
      "TDFHcjw2PiDLjoqxXedaSSEtA1osqu8J6c",
    ],
  },
  polygon: {
    owners: ["0x1cA5aa5b1dd8D948bB0971A5fB1762FE172E0040"],
  },
  base: {
    owners: [
      "0x1cA5aa5b1dd8D948bB0971A5fB1762FE172E0040",
      "0x7Ff8bbf9C8AB106db589e7863fb100525F61CCe5",
      "0xe5e6c3ced4670697b7cB27a53649a3ED321c18ee",
      "0x88C984990573d385949deB571ed21eaD63301045",
    ],
  },
  cardano: {
    owners: [
      "addr1qxdx2vxw9mdqkwq4eyss4xd03g9amv5ahw7je9d7ms748ey6v5cvutk6pvuptjfpp2v6lzstmkefmwaa9j2mahpa20jqudqquv",
      "addr1qx7ulwm3gkfxdxzsvsd3a8j8tfxql2j75tc572wk73zyz9kg6jsax3gztqfqneqsw05k7vl4r74zt9aaxe93gsxdx8lqjzrfdz",
      "addr1q9pnql2ut22sw3695jxcegfu8f273jyw78u8605tlx3gj0vf7nsu5v2rrpxpxwsx5ekxx07m3yy4jry5v706aqa4gklq7mwa54",
    ],
  },
  algorand: {
    owners: ["0x1cA5aa5b1dd8D948bB0971A5fB1762FE172E0040"],
  },
  aptos: {
    owners: [
      "0xc16f4401c43f0f787c37f80b21411e8db9d2d7a8f29cf2ede6dbeb9729f3b320",
    ],
  },
  avax: {
    owners: [
      "0x1cA5aa5b1dd8D948bB0971A5fB1762FE172E0040",
      "0xe5e6c3ced4670697b7cB27a53649a3ED321c18ee",
    ],
  },
  berachain: {
    owners: ["0x7Ff8bbf9C8AB106db589e7863fb100525F61CCe5"],
  },
  litecoin: {
    owners: [
      "Ldjngq3HdTzVLwGLj7TpryQUaFtqydo3HZ",
      "ltc1qywl4m70amwmrtecxsjz0m08hj64dekmv536asn",
      "LNUyAM2BssY6CqSN5BNoNTAY4W1q4uV7Eb",
    ],
  },
  sonic: {
    owners: [
      "0x7Ff8bbf9C8AB106db589e7863fb100525F61CCe5",
      "0x88C984990573d385949deB571ed21eaD63301045",
    ],
  },
  ton: {
    owners: [
      "EQCBcLfo7OvsKSVXjqnKY_XpuOEIQtb-acHnk5hS7j9Shl0t",
      "UQABlbgTwNXZds4fnfdDnQ9GG-vUrebORaA4hbRmleZP5M3e",
    ],
  },
  ripple: {
    owners: [
      "rKBRWUTreGNU9d3pL2gYUo23jn4UdKiAoS",
      "rPkX96xtMY2cxQ4Az3N54MB2vTHrp1PTjK",
      "rBSojpgcRp9LvBguQXzrvNAyuzkP4Z8pZr",
    ],
  },
};

module.exports = cexExports(config);
