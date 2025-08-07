const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');
const ADDRESSES = require('../helper/coreAssets.json');

// https://docs.hyperunit.xyz/developers/key-addresses

module.exports = {
  methodology: 'HyperUnit Hot wallets For BTC/ETH/SOL',
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
    tokens: ['9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump', 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn', 'J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr', 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263']
  })
  }
};
