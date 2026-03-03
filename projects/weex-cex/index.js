const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  ethereum: {
    owners: [
      "0x7bceb96a8757114d79c7dcd6b52c460202f17d13",
      "0xc3b77c3f5a733986558c91e0faf95f1659b1b9b6",
      "0xe955e61fb93b0871953d5c55f8afd416ebaafda4",
      "0x425c91fbde3d472279b914b7c4c9142266d35004",
      "0x5d75dfc37EFF183435e8fE307bcB05B4d2675F37",
      "0xa0e8C61d1B378c0eC4cFFED9382e5b7fE37a9860",
      "0x50956a84Fe22AADC2C2f3E551601A2b38117C72d",
      "0xC06263d0B432DCFba27f8a9867e68B49fEBD9FBa",
      "0xdf2c499306de58294bde422484c7091bfeca5bde",
      "0xe955E61Fb93B0871953d5C55f8afd416EbaAfdA4",
      "0x0010cA201A1915c500479d5ecc474567B0C12E80",
      "0x1156c95d8c7d195a5c49e13621dab0bb69de6630",
      "0xb542ffd0cf52e2de84ee0e6ee415fbb4e4183b30",
      "0x504abab033b8ae51cb02fd0ce93a3cda5efd3c64",
      "0xfb20aed5f49a2639d1cb3d5b6e3cc8df6cbcf60a",
      "0xc0f1f047c3c4b52d1e7a54e5583a99c6b3e6d2bb",
      "0x93d0391d7b28ab1e01df29e49793795dea01ae16",
      "0xf4ed2f0994288c7ce3b3537b4fbfff9c4fc2a3ff",
      "0x5875d9b0bba20e3b393aad0c61e2e2d78c375db1"
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.weex,
  },
  base: {
    owners: ["0x7bceb96a8757114d79c7dcd6b52c460202f17d13"],
  },
  avax: {
    owners: [
      "0xc3b77c3f5a733986558c91e0faf95f1659b1b9b6",
      "0xb860db9d581bd95835c5512433ef86225aaced1f",
      "0xf7e5861c18f8d98108bbdc546c94709f6e3e2bc4",
      "0x218c4e05de957791d77c51585f2e1dcc5b60eab8",
    ],
  },
  bsc: {
    owners: [
      "0xc3b77c3f5a733986558c91e0faf95f1659b1b9b6",
      "0x7cb8e2896234cbc8494f858e05be30b13ad5ddb7",
      "0xf7e38e6aa48ce79efa7694a1b9c5bb178253bd98",
      "0xf0c3b78409bbe1aacef3f55fd4d50c3f1da8c939",
      "0x12838441c7f8d064ea003f131db847cac123175d",
      "0x1ce0788fabcb32344d05b5c94a5bddb15f7c749e",
      "0xe5b33a9cf71c7ef0d6404cb2e98a99edb576c086",
      "0xa0e8C61d1B378c0eC4cFFED9382e5b7fE37a9860",
      "0x7E88F5EaAB80549358ace2daaD5B367F8E037489",
    ],
  },
  polygon: {
    owners: [
      "0xc3b77c3f5a733986558c91e0faf95f1659b1b9b6",
      "0x41b8ce8fce54a418d4a523205a6cc50f0c5beff8",
    ],
  },
  arbitrum: {
    owners: [
      "0xc3b77c3f5a733986558c91e0faf95f1659b1b9b6",
      "0x0b2b7edbdb241f11ce0a47374836a2a8643a7cf0",
      "0x9f6d65052ad5818768fcbac3b799a67f2b8e7170",
      "0x7e6e3c507933b586ef02272ab27ce3df10b18018",
      "0x35ed1fa92851a5dca476e546a23d81ede969b7fd",
      "0x871084a0df5d315361db995db241811857a41770",
    ],
  },
  optimism: {
    owners: [
      "0x7bf61e825899a552b67bf3aa7e7a1a714a0d4fda",
      "0xbb827bd031ca29e93f0d448763cd002d946f0761",
      "0xfec7f8d947813c7c6fe495159e62fd9cb896f4e6",
      "0x5f77b0df59e5e4277ac298def75ee7196626836d",
      "0x058cd9be394a5990663ab90e862dea0cfea6cbe0",
      "0xc3b77c3f5a733986558c91e0faf95f1659b1b9b6",
    ],
  },
  tron: {
    owners: [
      "TMyVbp3jMTdXpcjjxMZy7Xv4FeXTp4xXTf",
      "TLivLCvVQrUfSQcddhg23JDgM58ML91mQf",
      "TRqwFyiNwEnMUM85qC9tQqKDZh6dwo6yKd",
      "TSeZBAnnuaEPhT6Mqq5TQV51Cx3zzDikug",
      "TPKmFfmvYauE759CRwjYJxDFCPcCDVPAgU",
      "TMQTsX7nsEuiDEiBxW57u8myk1aPpMV7gP",
      "TAZN4ynsgppYb9uyNkrFSY4K68trDBocpz",
      "TFhpaJmxgwBxyMRozTdRbGYQsdYLng9SDU",
      "TXUmtHbZLygwZeEb1zRx8h9GEuj95upAD6",
      "TPoyMWhuo6ybDjtqQcox6E83uGPDDRpaGK",
    ],
  },
  solana: {
    owners: [
      "eKfAkykrMPx2CqhcbywnbTkpGAyfkppNvXQ2VPNiQWL",
      "Dw4JrqHdzh489rkQqf5RaATpyLBSJABwBb2C3PAYDQgX",
      "BCGzwLX1MmAosKrfMH1NauCSB6pej7uojeuNZrZCR9BL",
    ],
  },
  ton: {
    owners: [
      "EQB4XClemsAbLvlDjobh-VjUn7oEy9CITWPoG9WkTO2qRx_m",
      "EQCnYwCum_kGC9LtZ_cF3UqZlElCvYMZ_k1U3iToOQfonqvK",
      "UQAZw2qHn-DgS3AQcN0iTGld0ekISufl6u6P71Hf66iV7Ri6",
      "EQAQ5H-njGMGAI49lJH1Xb1KKV-I7Z1-Xzr9xM19pkS-AW6p",
    ],
  },
};

module.exports = cexExports(config);
