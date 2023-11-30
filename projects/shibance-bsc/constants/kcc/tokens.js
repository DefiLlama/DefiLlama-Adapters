const ADDRESSES = require('../../../helper/coreAssets.json')
const tokens = {
  bnb: {
    symbol: "BNB",
    projectLink: "https://www.kucoin.com/",
  },
  kwoof: {
    symbol: "KWOOF",
    address: {
      321: "0x192F72eFD1009D90B0e6F82Ff27a0a2389F803e5",
    },
    decimals: 18,
    projectLink: "https://shibance.com/",
  },
  syrup: {
    symbol: "DOGGYPOUND",
    address: {
      321: "0xc72B04864aE423CD97F83E49D53b76b5937de8C8",
    },
    decimals: 18,
    projectLink: "https://shibance.com/",
  },
  wbnb: {
    symbol: "wBNB",
    address: {
      321: ADDRESSES.kcc.WKCS,
    },
    decimals: 18,
    projectLink: "https://www.kcc.io/",
  },
  busd: {
    symbol: "BUSD",
    address: {
      321: ADDRESSES.kcc.USDT,
    },
    decimals: 18,
    projectLink: "https://www.kcc.io/",
  },
  usdc: {
    symbol: "USDC",
    address: {
      321: ADDRESSES.kcc.USDC,
    },
    decimals: 18,
    projectLink: "https://www.kcc.io/",
  },
  ghost: {
    symbol: "GHOST",
    address: {
      321: "0x3341a4cc481637a773187400227446f85f66da0a",
    },
    decimals: 9,
    projectLink: "https://twitter.com/kughostkcc/",
  },
  kust: {
    symbol: "KUST",
    address: {
      321: "0xfc56a7e70f6c970538020cc39939929b4d393f1f",
    },
    decimals: 18,
    projectLink: "https://kustarter.com/",
  },
  kafe: {
    symbol: "KAFE",
    address: {
      321: "0x516F50028780B60e2FE08eFa853124438f9E46a7",
    },
    decimals: 18,
    projectLink: "https://kukafe.finance/",
  },
};

module.exports = tokens;
