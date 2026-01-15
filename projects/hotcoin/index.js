const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  ethereum: {
    owners: [
      "0x10b620f9720C0c6460484A81C59a6297Fa48F817",
      "0xbB916e1E722f69d9fdFE6805f3dEDD51353f8E55",
      "0x5B5627C9686c5744534C8aa7d9C312DA88794b8E",
    ],
  },
  tron: {
    owners: [
      "TDZu7rwKeMrcXQRfmzA2fQUb1bCYUoJfPw",
      "TDVBTADNXp7PuLLXdHyLn1v96Q2Kx1GKYE",
      "TXNUMHHvazAEPyjECzAqVrnCwJV559ijYv",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.hotcoin,
  },
  scroll: {
    owners: [
      "0xB54259245da3578C02591565Fa88a678aD542146",
    ],
  },
  optimism: {
    owners: ["0x1Fa51b8A412b32FB7e4C25082471214f22D0c9D9"],
  },
  op_bnb: {
    owners: ["0x84B13Be1968cE1caEE7431BD6f84CB2EBc7F8325"],
  },
  solana: {
    owners: ["78TDoKGTeS7RRoqUrSijS1QVFVmxJvwE2NxYicHFHh3N"],
  },
  arbitrum: {
    owners: ["0xc2997c47ff647Db91092Cf0ad184E91FB5F80D6F"],
  },
  polygon: {
    owners: ["0x72a73dC55a7038cb4707F2a23aC2AE705A8Fa888"],
  },
  bsc: {
    owners: ["0xa1ab382330d6b7a99ee3441e6594e49790294e4e", "0xDCd7eFd91A6afD14168352023fCC8939601ea0bc", "0x6EDA9105761B840F9D24d34Ab1dC28629EcC35fd"],
  },
};

module.exports = cexExports(config);
