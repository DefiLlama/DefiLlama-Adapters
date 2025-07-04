const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');
const ADDRESSES = require('../helper/coreAssets.json');

// https://docs.hyperunit.xyz/developers/key-addresses

module.exports = {
  methodology: 'BTC wallets on bc1pdwu79dady576y3fupmm82m3g7p2p9f6hgyeqy0tdg7ztxg7xrayqlkl8j9',
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.unitbtc }),
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: ["0xBEa9f7FD27f4EE20066F18DEF0bc586eC221055A"],
      tokens: [ADDRESSES.ethereum.WETH, ADDRESSES.null], 
    }),
  },
  solana: {
    tvl: sumTokensExport({
    chain: 'solana',
    solOwners: ['9SLPTL41SPsYkgdsMzdfJsxymEANKr5bYoBsQzJyKpKS'],
    owners: ['9SLPTL41SPsYkgdsMzdfJsxymEANKr5bYoBsQzJyKpKS'],
    tokens: ['9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump']
  })
  }
};
