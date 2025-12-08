const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  ethereum: {
    owners: [
      "0x8e04af7f7c76daa9ab429b1340e0327b5b835748",
      "0xefa73f3858392565e1566b70caa27ce79337a2c3",
    ],
  },
  bitcoin: {
    owners: [
      "1GRciJqtfPgL3FJCCco3L3Q74XSaQ4Lr4E",
      "18qZ6nkZAQNCVktMixd9Kb3YJ5KPx4E5ov",
      "1E2tKutAWLWtBSwrH2T8XGr1ZjDqrQ6SdN",
    ],
  },
  polygon: {
    owners: ["0x8e04af7f7c76daa9ab429b1340e0327b5b835748"],
  },
  tron: {
    owners: ["TPEXEpjuuRSxpV7vnCrHAefuAMV5VsNAQ4"],
  },
  bsc: {
    owners: ["0x19c8da00dff2967ea4ec0d77aec93a8bc387e08b"],
  },
  solana: {
    owners: ["6UsYfLKTdVGJdaWFBLjBYqqxFSUjh6nwpBqdh6R8n3sv"],
  },
};

module.exports = cexExports(config);
