const { sumTokensExport } = require("../helper/unwrapLPs");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');

const config = {
  bsc: {
    owners: ["0xb37cf50f279a5f6c63cc33f447679e600d03394f", "0x9537bc0546506785bd1ebd19fd67d1f06800d185"],
    tokens: [
      "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",  //BTCB
    ],
  },
  ethereum: {
    owners: ["0x9bc8ef6bb09e3d0f3f3a6cd02d2b9dc3115c7c5c", "0xbe6297731720b7e218031ca8970921f9b41f3d00", "0xad713bd85e8bff9ce85ca03a8a930e4a38f6893d", "0xb4378d4e3528c12c83821b21c99b43336a543613"],
    tokens: ["0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", "0xC96dE26018A54D51c097160568752c4E3BD6C364", "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", "0x18084fbA666a33d37592fA2633fD49a74DD93a88"], //WBTC FBTC cbBTC TBTC
  },
    bitcoin: {
      owners: bitcoinAddressBook.solvbtc
  },
  arbitrum: {
    owners: ["0x032470abbb896b1255299d5165c1a5e9ef26bcd2"],
    tokens: ["0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"], //WBTC
  },
  bob: {
    owners: ["0x33b7a7a164b77433a61d4b49bd780a2718812e6e"],
    tokens: ["0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3"], //WBTC
  },
  linea: {
    owners: ["0x35ce7fa5623b8a5cf1cf87a8bf8d64ad8da1443e"],
    tokens: ["0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4"], //WBTC
  },
  soneium: {
    owners: ["0xedcd3b3e3d7724908abf5341427143fd2d258e48"],
    tokens: ["0x0555E30da8f98308EdB960aa94C0Db47230d2B9c"], //WBTC
  },
  mantle: {
    owners: ["0x33b7a7a164b77433a61d4b49bd780a2718812e6e"],
    tokens: ["0xC96dE26018A54D51c097160568752c4E3BD6C364"], //FBTC
  },
  merlin: {
    owners: ["0x6a57a8d6c4fe64b1fd6e8c3e07b0591d22b7ce7f"],
    tokens: ["0xB880fd278198bd590252621d4CD071b1842E9Bcd"], //native btc on merlin
  },
  base: {
    owners: ["0xcdaaaa09e6e0de3e7171259cf6962e4d44f983f9", "0xf2416c264aa4068ff4d1949383366458f295f205"],
    tokens: ["0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", "0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b"], //cbBTC Tbtc
  },
  /*
  avax: {
    owners: ["0x33b7a7a164b77433a61d4b49bd780a2718812e6e"],
    tokens: ["0x33b7A7a164B77433A61d4B49bD780a2718812e6e"], //BTC.B
  },
  */
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ...config[chain] }),
  };
});

module.exports.methodology =
  "Counts the collateral for solvBTC in each chain";