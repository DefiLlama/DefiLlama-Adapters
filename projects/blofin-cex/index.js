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
      "0x7Ff8bbf9C8AB106db589e7863fb100525F61CCe5",
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
      "0x6339d50D4E5a8aaf1b5e0b57C85b0EC3569F3B93",
      "0x687054E92093DaFf65221fb77420ec6555d7c5a9",
      "0xec5618Db70aE9d88EC40Fdb844455167418f8193",
      "0xafE7EB9d224bC3cd7d9F88099D71B1c1c3BC2f93",
      "0x055c1C6b09Fb4f5F229125aFcBBF98E734dFC725",
      "0x7Ff8bbf9C8AB106db589e7863fb100525F61CCe5",
      "0x7515c526E7B3F67439a515F1ad73c650F313E34b",
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
      "2ZC474Fx1NheoK37WbQoRCKZFLCeGk2an145j2qntuup",
    ],
  },
  optimism: {
    owners: [
      "0x1cA5aa5b1dd8D948bB0971A5fB1762FE172E0040",
      "0x7Ff8bbf9C8AB106db589e7863fb100525F61CCe5",
    ],
  },
  arbitrum: {
    owners: [
      "0x1cA5aa5b1dd8D948bB0971A5fB1762FE172E0040",
      "0x7Ff8bbf9C8AB106db589e7863fb100525F61CCe5",
    ],
  },
  tron: {
    owners: [
      "TDFHcjw2PiDLjoqxXedaSSEtA1osqu8J6c",
      "TE4uQTkFMcjm7UVYeQCgTHuec1pFP5J4Ds",
      "TRzpEdrAwHXPQYWvXHJArpcac2WV3gXMr3",
      "TVNRJgNsVMjDPethVVToz9aSvZq9SVgDXv",
      "THTGgHWFXwgaZEDdaQmR6iuUEa7NKfCUtH",
      "TDFHcjw2PiDLjoqxXedaSSEtA1osqu8J6c",
      "TGJUBfrpYsm2K61jEAqm35f7A9P5XpRNjC",
      "TTRSjzeqYRghvxZXRdXsiUASt6iU91qtUu",
      "TEVoZgTB3WsjTjDnxm4BY8CHsULmAjboSA",
      "TVdNydXPaPFF4b2x7CKYiNjEWfi5C5AnV8",
      "TUGmVxfPYzZtctCqxx9CGLnB4jWUZGtFh2",
      "TC3XTY9ZM5hcdadRmtGegTFBmiF6rCLLnb",
      "THcCxhETmLu2F5QEwyhKPe8UWHrjS4FGDN",
    ],
  },
  polygon: {
    owners: [
      "0x1cA5aa5b1dd8D948bB0971A5fB1762FE172E0040",
      "0x7Ff8bbf9C8AB106db589e7863fb100525F61CCe5",
    ],
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
    owners: [],
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
      "0x7Ff8bbf9C8AB106db589e7863fb100525F61CCe5",
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
      "ltc1qsvqz9tw4v8kx7wpt2j3q7l8dgvucjwc6zlxm78",
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
      "rJMH2SNxmr7e3wsp6jbsQoGRWzqiAzsFny",
    ],
  },
  hyperliquid: {
    owners: ["0x7Ff8bbf9C8AB106db589e7863fb100525F61CCe5"],
  },
  mantle: {
    owners: ["0x7Ff8bbf9C8AB106db589e7863fb100525F61CCe5"],
  },
  doge: {
    owners: ["DCH2NkFZ7k5ombczgUNeDrijHeaQUdNJbA"],
  },
};

module.exports = cexExports(config);
