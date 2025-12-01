const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  bsc: {
    owners: [
      "0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717",
      "0x247ee531ea21f7b182dcfe5ef3ee6abedb4f086c",
    ],
  },
  arbitrum: {
    owners: ["0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717"],
  },
  ethereum: {
    owners: [
      "0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717",
      "0xa7c23c824fa730065ab9367947cc139687536284",
      "0xd7b73e4f5f373ef11bb4a22f7e8d2b4db051fbfb",
      "0x0070fb0677edb8b6e61ce6f5976c32e99d74be13",
      "0x9c9c67578d746595c0e331e13f9b378326569c56",
    ],
  },
  polygon: {
    owners: ["0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717"],
  },
  base: {
    owners: ["0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717"],
  },
  optimism: {
    owners: ["0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717"],
  },
  avax: {
    owners: ["0x03bd8283b68af907e2e5d6ff3ae2617c00a1d717"],
  },
  bitcoin: {
    owners: [
      "bc1qpcae7ucadgf5mj4ntn36xnr6rv39why6yf3l7t",
      "bc1qpfwp4u3qxljq25hs5ewgqqzdexvx5sqhsk4geg",
      "bc1q33493ufeq3wrn8ur30gehgnnaqduemfnkt60pa",
    ],
  },
  ton: {
    owners: ["UQAy9dYvynVbnkbv5hynU2456gFGCqNXth7ldjTLsQ1KmsOV"],
  },
  solana: {
    owners: ["BLGFthn7CqHsJHkucwiBWyv1BruRYszfmdW5Xg8dFT3m"],
  },

};

module.exports = cexExports(config);
module.exports.methodology =
  "We have collect this wallets from https://levex.com/en/assets/proof-of-reserve.";
