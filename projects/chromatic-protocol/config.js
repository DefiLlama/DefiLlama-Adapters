const ADDRESSES = require("../helper/coreAssets.json")

module.exports = {
  arbitrum: {
    tokens: {
      USDT: ADDRESSES.arbitrum.USDT,
    },
    vault: "0x19631A51aeDcd831E29cbCbCfe77010dAfd3343a",
    pools: {
      USDT: {
        BTC: [
          {
            name: "crescendo long & short ( deprecated )",
            address: "0xAD6FE0A0d746aEEEDEeAb19AdBaDBE58249cD0c7",
          },
          {
            name: "plateau long & short ( deprecated )",
            address: "0xFa334bE13bA4cdc5C3D9A25344FFBb312d2423A2",
          },
          {
            name: "decrescendo long & short ( deprecated )",
            address: "0x9706DE4B4Bb1027ce059344Cd42Bb57E079f64c7",
          }
        ],
      },
    },
  },
}
