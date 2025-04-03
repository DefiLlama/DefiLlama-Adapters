const { cexExports } = require("../helper/cex");

const config = {
  bitcoin: {
    owners: ["bc1qaf3sran0nfsgvgjdks7f5wuvuqnlhyx8dtcg46"],
  },
  ethereum: {
    owners: [
      "0x5e49DF16423725ee4A3e6d49ed6e8Ba379FD8C5a", //eth hot wallet
    ],
  },
  bsc: {
    owners: [
      "0x5e49DF16423725ee4A3e6d49ed6e8Ba379FD8C5a", // bnb hot wallet
    ],
  },
  ton: {
    owners: [
      "UQBgT2Zt4W3uibtwHkSFqEAxhUja0I35r0BIX9-jjgIfAPdf", // ton hot wallet
    ],
  },
  solana: {
    owners: [
      "6GRRdWkMB9WgykNhHS4nXvYyKt6gEwppBuuqe7XfqnBf", //hot wallet
    ],
  },
  tron: {
    owners: [
      "TYjYYR3Wx1TxrYHdL5un8QF7JCBBW5jcFQ", // hot wallet
      "TPFMn8QFSbVVm52eAY8NQCw1pTSX4UVw2U", // energy
      "TCZWDvt2nyShPSDynb14Gf5BnJ8NNC7z8T", // staking
    ],
  },
};

module.exports = cexExports(config);
