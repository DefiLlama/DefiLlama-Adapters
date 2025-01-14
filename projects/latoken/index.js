const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: {
    owners: bitcoinAddressBook.latoken
  },
  ethereum: {
    owners: [
      "0x8D056D457a52c4dAF71CEf45F540a040c143Ea05", //eth hot wallet
      "0x7891b20c690605f4e370d6944c8a5dbfac5a451c", //eth cold wallet
      "0xeE61F5fB0dB81d3A09392375Ee96f723C0620E07", //erc20 hot wallet
      "0xc00EEbe4E2bE29679781fc5fC350057eE8132BaB", //erc20 subsidy wallet
      "0x4114d8D509503592175A8E044594b29EC081dbe0", //eth custody wallet
      "0x00343217B01188388C0E3242278231Ace35E1b61", //eth custody2 wallet
      "0x9976c40e8186a5E0C2a9D50d55b51F905d10ce52", //eth custody3 wallet
    ],
  },
  polygon: {
    owners: [
      "0x235e8ceD6b42eE6E226837EB551E86D810d49f22", //hot wallet
      "0xA614180C69aBF82f3E7AAbB53AD9976EC90aeAC6", //subsidy wallet
      "0x235e8ceD6b42eE6E226837EB551E86D810d49f22", //hot wallet
      "0xA614180C69aBF82f3E7AAbB53AD9976EC90aeAC6", //subsidy wallet
    ],
  },
  avax: {
    owners: ["0xeD8D8f4Ff53915D80987BCD51C2DE582a05b2322"],
  },
  cardano: {
    owners: [
      "addr1vx6kespckg27xu879kf40mpv4pmjxl0ad5hewq067e3d50crylyhc", //hot wallet
      "addr1v804l0u7q4ju4eyrd8ykvvdehryn6qyz3n4nh8ucfr8s3pgeskjvu", //subsidy wallet
    ],
  },
  algorand: {
    owners: ["FQQQS3UJFSNYCII2KE5XSCUB5ZIV2HUFVQ22QYLGI3ONFTPOFMAF5HLLZE"],
  },
  cosmos: {
    owners: [
      "cosmos1wt5sdluapdqrp8wljyesl7s3x5vzq5z76t4nuj", //hot wallet
    ],
  },
  bsc: {
    owners: [
      "0xBA6C98f1cc6869ECCbeB892b7A603F8F02Db3b29", //cold wallet
      "0xCE55977E7B33E4e5534Bd370eE31504Fc7Ac9ADc", //hot wallet
      "0x9480D1cc3fd4cb7936D114f7d63124107870A7b8", //custody wallet
      "0xd76D939B455743e96adbCdf800627b11F3446780", //swap wallet
      "0xBA6C98f1cc6869ECCbeB892b7A603F8F02Db3b29", //token cold wallet
      "0xCE55977E7B33E4e5534Bd370eE31504Fc7Ac9ADc", //token hot wallet
      "0x9480D1cc3fd4cb7936D114f7d63124107870A7b8", //token custody wallet
      "0xd76D939B455743e96adbCdf800627b11F3446780", //token swap wallet
    ],
  },
  // celo: {
  //   owners: ["0xEeC02a6D1a7F9f534b9609c8EE30B9cF9A7fe1B3"],
  // },
  elrond: {
    owners: ["erd1z5xjeu4xw32jkckhj9jpc9dymj6a9h8yxtch96e43ncp6fhuzpnqshqutj"],
  },
  eos: {
    owners: ["latokenabbc1", "latokeneos11"],
  },
  // energyweb: {
  //   owners: [
  //     "0x26b52C889FCf3B8f449aD1c0F07b8572E6ACE262", //hot wallet
  //     "0x0F307b17d41acE555620DF5a55Dd5A01637e3b42", //cold wallet
  //     "0x6fb194fc9806fE320E0CBD658e31F13B1bAa3925", //custody wallet
  //   ],
  // },
  ethereumclassic: {
    owners: [
      "0xE69963CE13ED742639C8287913682bC008B3e622", //hot wallet
    ],
  },
  // lachain: {
  //   owners: ["0xEFf6E17Fdc68d56812DA40f7d05FC8cDfd212440"],
  // },
  // filecoin: {
  //   owners: ["f1iy5dvp6ggzhtraxodbfdkbiw5s67mhff4w43pai"], //hot wallet
  // },
  // gochain: {
  //   owners: [
  //     "0xA1a0538D556B3E77f7E1340E3Ebd70C649c4bb84", //hot wallet
  //     "0x1771C9c8d5AF830d322c2E1D2161D002844679EF", //subsidy wallet
  //   ],
  // },
  // injective: {
  //   owners: [
  //     "inj1uyc234cek2ja9ru7a870cmx2lcavt5um2nk6hh", //hot wallet
  //   ],
  // },
  // neo3: {
  //   owners: ["NMngTcDdCq3cFNHiPBvtim73HLuG3Dzkwb"],
  // },
  // proton: {
  //   owners: ["protonla"],
  // },
  polkadot: {
    owners: ["1347e3PfJKKcJL4XJhFeZ5UmZYRnk26Vs9aGjZ8RZLPkWWNY"],
  },
  solana: {
    owners: [
      "51AASorYCLPcUHnuQQaau6DfsfFRixzh4HsoQwsc5Ara", //hot wallet
    ],
  },
  optimism: {
    owners: [
      "0xecabeA0fB22f82F3A5a5D6043D7cCf65F3640c85", //hot wallet
      "0x3b28358e9CDde80A24f0f811daD13aB9fc2A0d2A", //subsidy wallet
    ],
  },
  terra: {
    owners: ["terra14rvsrmq47pr9v5pkdkttftgh526jeeluyumalk"],
  },
  terra2: {
    owners: ["terra13x5jkljx69vyak47k9e9u9qetu0sckxpfysrp7"],
  },
  tezos: {
    owners: [
      "tz2QLHkGgaXqoeqUFxUJXAvZ9pdQ2HQDhTe4", //hot wallet
    ],
  },
  tron: {
    owners: [
      "TT2YwaJ8DXsrpycgBGDWEei1FUQm6YT85T", //hot wallet
      "TUJrDuFr6ALjtZehcpFRKnBCCo79Gs76ww", //cold wallet
      "TVNdyXbcJ5ZwwFsjnScrNXSv9d435guynT", //subsidy wallet
    ],
  },
  zilliqa: {
    owners: [
      "zil1rklazrfy5spul4tqzc2jqfvuneszcjrdya6a8y", //hot wallet
    ],
  },
};

module.exports = cexExports(config);
