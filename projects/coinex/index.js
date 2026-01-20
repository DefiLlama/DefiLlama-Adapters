const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");
const { mergeExports, getStakedEthTVL } = require("../helper/utils");

const config = {
  ethereum: {
    owners: [
      "0x187e3534f461d7c59a7d6899a983a5305b48f93f",
      "0x33ddd548fe3a082d753e5fe721a26e1ab43e3598",
      "0x90f86774e792e91cf81b2ff9f341efca649343a6",
      "0x85cf05f35b6d542ac1d777d3f8cfde57578696fc",
      "0xda07f1603a1c514b2f4362f3eae7224a9cdefaf9",
      "0x601a63c50448477310fedb826ed0295499baf623",
      "0x53eb3ea47643e87e8f25dd997a37b3b5260e7336",
      "0xd782e53a49d564f5fce4ba99555dd25d16d02a75",
      "0x5ad4d300fa795e9c2fe4221f0e64a983acdbcac9",
      "0xAFedF06777839D59eED3163cC3e0A5057b514399",
      "0x38f6d5fb32f970Fe60924B282704899411126336",
      "0xD4d2960E1e58a597723aE021cc811193f79153B1",
      "0xf335788b2251dEc93332310d96d15500cdC4C34b",
      "0x20145C5e27408B5C1CF2239d0115EE3BBc27CbD7",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.coinex,
  },
  tron: {
    owners: [
      "TS98H6jSx6uv1gG1vx6CJZMeYGkMZXgQ7K"
    ],
  },
  starknet: {
    owners: [
      "0x00fb108ed29e1b5d82bb61a39a15bbab410543818bf7df9be3c0f5dd0d612cf3",
    ],
  },
};

module.exports = mergeExports([
  cexExports(config),
  { ethereum: { tvl: getStakedEthTVL({ withdrawalAddresses: ['0xafedf06777839d59eed3163cc3e0a5057b514399' , '0x548054687ef6c56c6d82e8269e5fd93d8b88fcb2'], size: 200, sleepTime: 20_000, proxy: true }) } },
])
