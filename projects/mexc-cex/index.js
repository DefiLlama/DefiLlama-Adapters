const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const config = {
  bitcoin: {
    owners: bitcoinAddressBook.mexcCex,
  },
  ethereum: {
    owners: [
      "0x3cc936b795a188f0e246cbb2d74c5bd190aecf18",
      "0x0162cd2ba40e23378bf0fd41f919e1be075f025f",
      "0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88",
      "0xee136c0389733849dd710ac7104e92c6bf497574",
      "0x3cc936b795a188f0e246cbb2d74c5bd190aecf18",
      "0xe4e3ECA65460C14a5245b09fee15a92bA09458b6",
      "0xf016E1D45EF23Bdd414E7A2E4D46E1b34577b508",
      "0x12C5E4EEEaA20E25847b5453D23246983c512DB7",
      "0xD67f25Ef2399A0C769B1A35634C5Ce77166714dB",
      "0xc411aB12837f63935b71B6c6643d0f7000e55E4b",
      "0x1F7370792a057227024e7a8Cc15b40E3eD171FfC",
      "0xf95334a86d09A6eEc74D69Da344efaca424B13a9",
      "0x76bf215ADE956642B056B9043e014988941BbdDd",
      "0x469AfE803C54A36674C55231489Cf4b61da8c1bC",
      "0x9642b23ed1e01df1092b92641051881a322f5d4e",
      "0xb5a6fd438017dbb0a2e5fcdcca715da227582ce4",
      "0x3cc936b795a188f0e246cbb2d74c5bd190aecf18", 
      "0x9642b23ed1e01df1092b92641051881a322f5d4e", 
      "0x1Ed0be7d0A9580e202F6b98c29725d5C11D10b71", 
      "0x6e5a3b0021949452D31A43BE17D808De54752a44", 
      "0x2fF5fc5b63f2bfCE5d6BB9Ea4d170cf1aa40693c"
    ],
  },
  bsc: {
    owners: [
      "0x4982085c9e2f89f2ecb8131eca71afad896e89cb",
      "0x2e8f79ad740de90dc5f5a9f0d8d9661a60725e64",
      "0x7354abb551e41bbd9fb32e2e79f44631349119b8",
      "0x9bb6a22da110c6c9bab745bcaf0ee142ee83af37",
      "0x2e8f79ad740de90dc5f5a9f0d8d9661a60725e64",
    ],
  },
  polygon: {
    owners: [
      "0x51e3d44172868acc60d68ca99591ce4230bc75e0",
      "0x576b81F0c21EDBc920ad63FeEEB2b0736b018A58",
    ],
  },
  tron: {
    owners: [
      "TEPSrSYPDSQ7yXpMFPq91Fb1QEWpMkRGfn",
      "TB37WWozkkenGVYWD7Do2N5WT2CedqDktJ",
    ],
  },
  arbitrum: {
    owners: [
      "0x9b64203878f24eb0cdf55c8c6fa7d08ba0cf77e5",
      "0xb86f1061E0D79E8319339d5FDbb187D4E7Ad3300",
    ],
  },
  optimism: {
    owners: ["0xdf90c9b995a3b10a5b8570a47101e6c6a29eb945"],
  },
  starknet: {
    owners: [
      "0x069a7818562b608ce8c5d0039e7f6d1c6ee55f36978f633b151858d85c022d2f",
    ],
  },
  klaytn: {
    owners: ["0x9dd35021d77c1de5ed50b9d788a2f68903a96b96"],
  },
  avax: {
    owners: ["0xffb3118124cdaebd9095fa9a479895042018cac2"],
  },
  solana: {
    owners: [
      "5PAhQiYdLBd6SVdjzBQDxUAEFyDdF5ExNPQfcscnPRj5",
      "ASTyfSima4LLAdDgoFGkgqoKowG1LZFDr9fAQrg7iaJZ"
    ],
  },
  aptos: {
    owners: [
      "0xe8ca094fec460329aaccc2a644dc73c5e39f1a2ad6e97f82b6cbdc1a5949b9ea",
    ],
  },
  base: {
    owners: ["0x4e3ae00e8323558fa5cac04b152238924aa31b60"],
  },
  ton: {
    owners: [
      "EQDYh9Di0cT8QSbnHJcNM6sYlpQAAOrnA7sats7Mgwd3497j",
    ],
  }, 
  ripple: {
    owners: [
      "r3BFHL2EXZN4darZ7vH7BT7tP9tN7tyd6W",
      "rs2dgzYeqYqsk8bvkQR5YPyqsXYcA24MP2",
    ],
  }
};

module.exports = cexExports(config);
