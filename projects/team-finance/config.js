const abi = require("./lockcontract_v3.abi.json");
const abi_v2 = require("./lockcontract.abi.json");

module.exports = {
  ethereum: [
    {
      contract: "0xe2fe530c047f2d85298b07d9333c05737f1435fb",
      contractABI: abi,
    },
    {
      contract: "0xdbf72370021babafbceb05ab10f99ad275c6220a",
      contractABI: abi_v2,
    },
    {
      contract: "0xc77aab3c6d7dab46248f3cc3033c856171878bd5",
      contractABI: abi_v2,
    },
  ],
  kava: [
    {
      contract: "0xa9ec655dac35d989c0c8be075b1106dcd32502d6",
      contractABI: abi,
    },
  ],
  polygon: [
    {
      contract: "0x3eF7442dF454bA6b7C1deEc8DdF29Cfb2d6e56c7",
      contractABI: abi,
    },
    {
      contract: "0x586c21a779c24efd2a8af33c9f7df2a2ea9af55c",
      contractABI: abi_v2,
    },
  ],
  avax: [
    {
      contract: "0x88ada02f6fce2f1a833cd9b4999d62a7ebb70367",
      contractABI: abi_v2,
    },
    {
      contract: "0xe2fe530c047f2d85298b07d9333c05737f1435fb",
      contractABI: abi,
    },
  ],
  arbitrum: [
    {
      contract: "0xE0B0D2021293Bee9715e1Db3be31b55C00F72A75",
      contractABI: abi,
    },
  ],
  base: [
    {
      contract: "0x4f0fd563be89ec8c3e7d595bf3639128c0a7c33a",
      contractABI: abi,
    },
  ],
  fantom: [
    {
      contract: "0xccebbe9e2b8f46c2c6862238e60a396af790b63e",
      contractABI: abi,
      blacklist: ["0xc2995a065106b5c5c738b2320387460ebd12c12d"], // KyberSwap LP WFTM-DOA
    },
  ],
  cronos: [
    {
      contract: "0x05b711Df32d73ECaa877d45a637a2eB415e7995f",
      contractABI: abi_v2,
    },
    {
      contract: "0x4f0fd563be89ec8c3e7d595bf3639128c0a7c33a",
      contractABI: abi,
    },
  ],
  /* etherlink: [
    {
      chain: "etherlink",
      contract: "0xb6061efc3259a886cf3274efdf9b61753e1bc194",
      contractABI: abi_v2,
    },
  ], */
  blast: [
    {
      contract: "0x624a4cb48a52a29d97eb1127bd0585ea1e02143c",
      contractABI: abi,
    },
  ],
/*   zksync: [
    {
      contract: "0xe6fcefa80c6eec28b2682ebb6b4b476e7f2b9bdf",
      contractABI: abi_v2,
    },
  ], */
  mantle: [
    {
      contract: "0xd03450a71b81d408fc3d4f4bf928ca4da5328b14",
      contractABI: abi,
    },
  ],
  pulse: [
    {
      contract: "0xe2fe530c047f2d85298b07d9333c05737f1435fb",
      contractABI: abi,
    },
  ],
  odyssey: [
    {
      contract: "0x5dd3d67af1b31823dd3eee8548bdc070640c14b8",
      contractABI: abi,
    },
  ],
  flare: [
    {
      contract: "0x93ff61ac1ab23c5847c422d03be359c2b6c723c7",
      contractABI: abi,
    },
  ],
  klaytn: [
    {
      chain: "klaytn",
      contract: "0xb5c902ee211bae91ddb5c30b502c7ac6dfcd73f7",
      contractABI: abi,
    },
  ],
  lukso: [
    {
      contract: "0x7c2aa307c3542d8346bea3290385359c78778934",
      contractABI: abi,
    },
  ],
  berachain: [
    {
      contract: "0x5dd3d67af1b31823dd3eee8548bdc070640c14b8",
      contractABI: abi,
    },
  ],
  xlayer: [
    {
      contract: "0xf5cf29567350ebad9854ea22f3281d508ef1b96c",
      contractABI: abi,
    },
  ],
  unichain: [
    {
      contract: "0xfee008747a9c216e1edf4157fe0176bd32560efe",
      contractABI: abi,
    },
  ],
  monad: [
    {
      contract: "0x3a7de5f29557405f5d9fd06b570a53b966a78e8e",
      contractABI: abi,
    },
  ],
  robinhood: [
    {
      contract: "0x3a7de5f29557405f5d9fd06b570a53b966a78e8e",
      contractABI: abi,
    },
  ],
  arc: [
    {
      contract: "0x154479ca34d77a176e74c038b70df102d9be9935",
      contractABI: abi,
    },
  ],
  bsc: [
    {
      contract: "0x0c89c0407775dd89b12918b9c0aa42bf96518820",
      contractABI: abi,
      blacklist: [
        "0x6c7c87d9868b1db5a0f62d867baa90e0adfa7cfd", //TNNS
        "0xf2619476bd0ca0eda08744029c66b62a904c2bf8", //JRIT
        "0x854b4c305554c5fa72353e31b8480c0e5128a152", //WEL
        "0x070a08beef8d36734dd67a491202ff35a6a16d97", // SLP
        "0x9b83f4b893cf061d8c14471aa97ef24c352f5abe", // ubec-lp
      ],
    },
    {
      contract: "0x7536592bb74b5d62eb82e8b93b17eed4eed9a85c",
      contractABI: abi_v2,
    },
  ],
};
