const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  bitcoin: {
    owners: bitcoinAddressBook.bingCex,
  },
  arbitrum: {
    owners: ["0xd3D3a295bE556Cf8cef2a7FF4cda23D22c4627E8"],
  },
  bsc: {
    owners: [
      "0x0b07f64ABc342B68AEc57c0936E4B6fD4452967E",
      "0xc3dcd744db3f114f0edf03682b807b78a227bf74",
      "0x434742703055bd20f42142d9d70b0735a5eb1b14",
      "0x503b7050882335BAa0F384c671a23f9e7168a5ba",
    ],
  },
  ethereum: {
    owners: [
      "0xd3D3a295bE556Cf8cef2a7FF4cda23D22c4627E8",
      "0x909C1c195FC0a31758C7169B321B707C9F44886B",
      "0xF7b7775f6D31eC2d14984f1cA3e736F5FB896DA2",
      "0xAd8E5cEb7D77e10403Be8430717c515273c31b8d",
      "0x74E7Fd0b532f88cf8cC50922F7a8f51e3F320Fa7",
      "0xA1195F0d9B010F86633E1553F1286d74F80eF52B",
    ],
  },
  tron: {
    owners: [
      "TU72cTvdkWvoB7xgN5TXFtoXtUuWRuvUTm",
      "TVPQLkVXvN7MduHWhD4Q7rGVyRdDu5R8F6",
      "TErZkyXAoG4K67hmdvFUh6EgNARNETLkXX",
      "TRtC94y3QP9n5axxTsyaqsRtWDE5zwiyk3",
      "TFBfWTT5DPEWr3BEQQUJ1NpqS7cZuSntC7",
    ],
  },
  ripple: {
    owners: [
      "rPr5iwPZRVrxV7WACQxkYdoZtX4ikMxw9c",
      "rfqj8P5C36cRaFjpR5yYbb8XHYK9N5KNux",
    ],
  },
  solana: {
    owners: [
      "3Ln6KEgLoMR2xFHfqtYazP7CxFQPDtUVVtwCVsLKVfmV",
      "J1BGeK3ojLF5dqaNFLg7WkQToyYisY79pWvHHscTJcpD",
    ],
  },
  ton: {
    owners: [
      "UQDIv0mSHnXxE6C_CTIZXRkricGJwpUNg5PXU3BaZW1nFhqB",
      "UQCPPiMQG_bj1-C3oQzfsufaCQQiBCvNcPoMnsrV3pO9xrDg",
    ],
  },
};

module.exports = cexExports(config);
