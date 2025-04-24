const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: {
    owners: bitcoinAddressBook.latoken
  },
  ethereum: {
    owners: [
      "0xBC34887050D143F7D3a4ceac5FC1B7Ca6645eD21", //eth hot wallet
      "0x7891b20c690605f4e370d6944c8a5dbfac5a451c", //eth cold wallet
      "0x127276018F956d996F439c59504f49777687cB6A", //eth cold2 wallet
      "0x97fc7Eb57534191F1800073c5c31C0d7d7493e67", //erc20 hot wallet
      "0xc00EEbe4E2bE29679781fc5fC350057eE8132BaB", //erc20 subsidy wallet
      "0x4114d8D509503592175A8E044594b29EC081dbe0", //eth custody wallet
      "0x00343217B01188388C0E3242278231Ace35E1b61", //eth custody2 wallet
      "0x9976c40e8186a5E0C2a9D50d55b51F905d10ce52", //eth custody3 wallet
    ],
  },
  polygon: {
    owners: [
      "0x298Bd5Bdd51A13B7ab653FA0DC76681427121fEa", //hot wallet
      "0xA614180C69aBF82f3E7AAbB53AD9976EC90aeAC6", //subsidy wallet
      "0x298Bd5Bdd51A13B7ab653FA0DC76681427121fEa", //token hot wallet
      "0xA614180C69aBF82f3E7AAbB53AD9976EC90aeAC6", //token subsidy wallet
      "0xba6c98f1cc6869eccbeb892b7a603f8f02db3b29", //cold wallet
    ],
  },
  avax: {
    owners: ["0xeD8D8f4Ff53915D80987BCD51C2DE582a05b2322"],
  },
  cardano: {
    owners: [
      "addr1vy9wq3je4xrfhuha4krxfe9sw7q2ll2k7pcfsfdmayvue4qw7dgc9", //hot wallet
      "addr1v804l0u7q4ju4eyrd8ykvvdehryn6qyz3n4nh8ucfr8s3pgeskjvu", //subsidy wallet
    ],
  },
  algorand: {
    owners: [
      "ROH5LMHZLKHUGTNAVWNQB5LG4XHBFXM4FKNUUREDAB55UWDH2TY7S35KMU",
      "5L26VADNZTMVSLEGTRZJQQO233G5HUBN3H6TECS2LPUL3HUKXF6UT2YGFE"
    ],
  },
  cosmos: {
    owners: [
      "cosmos10zzdw24k8ytenpx95rklhnqnr95qutvhdwj0ez", //hot wallet
    ],
  },
  bsc: {
    owners: [
      "0xBA6C98f1cc6869ECCbeB892b7A603F8F02Db3b29", //cold wallet
      "0x6e4F21142CCEb4Ac5681379ab4f422903C90bf21", //hot wallet
      "0x9480D1cc3fd4cb7936D114f7d63124107870A7b8", //custody wallet
      "0xd76D939B455743e96adbCdf800627b11F3446780", //swap wallet
      "0xBA6C98f1cc6869ECCbeB892b7A603F8F02Db3b29", //token cold wallet
      "0x6e4F21142CCEb4Ac5681379ab4f422903C90bf21", //token hot wallet
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
      "0x0ED633983B8bBE458Df116E3F02cd441A909ff40", //hot wallet
      "0xBA6C98f1cc6869ECCbeB892b7A603F8F02Db3b29", //cold wallet
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
    owners: [
      "14Y6v82Rwp7FB7m1K4a6anpjbwRbdFLJWpeePqe4sFpa4yxw", //hot wallet
      "14tVS1ETLT8vqwaiCSjiqv55w59xWqUjFy1c5U9z2nauYYsj", //cold wallet
    ],
  },
  solana: {
    owners: [
      "DdAzYR2MyafpvxnpggygmjsYCqxVdW2FkhdEwjCiSi3w", //hot wallet
      "EiZxRDuRWF12DuiZ5pgeACrEgaGBjCnnMarhszdqVfGY", //cold wallet
      "4eNCYHUsZwtMBjXpDjhzaXp9MmwMd1dSdr9L1kUEuAxC", //cold2 wallet
    ],
  },
  optimism: {
    owners: [
      "0x1C91A83aeFDdFB2C09744b3BeC94D504E26cb56A", //hot wallet
      "0x3b28358e9CDde80A24f0f811daD13aB9fc2A0d2A", //subsidy wallet
      "0xba6c98f1cc6869eccbeb892b7a603f8f02db3b29", //cold wallet
    ],
  },
  terra: {
    owners: ["terra1zjq4jdvqtruvxgug64rn0p06kvp7r3qpxzrxdg"], //hot wallet
  },
  terra2: {
    owners: ["terra13x5jkljx69vyak47k9e9u9qetu0sckxpfysrp7"], //hot wallet
  },
  tezos: {
    owners: [
      "tz2W7hDSZrZg8h57Habj1GdPu674wS2Hpwvj", //hot wallet
    ],
  },
  tron: {
    owners: [
      "TM5nw5CT8S8brdBb1HPV5PCL7DqDaeFnJd", //hot wallet
      "TUJrDuFr6ALjtZehcpFRKnBCCo79Gs76ww", //cold wallet
      "TFLJixvV4jyxrWar9sne18M5bzS7tVEE8E", //subsidy wallet
    ],
  },
  zilliqa: {
    owners: [
      "zil1rklazrfy5spul4tqzc2jqfvuneszcjrdya6a8y", //hot wallet
    ],
  },
};

module.exports = cexExports(config);
