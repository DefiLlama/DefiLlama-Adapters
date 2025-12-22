const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');
const ADDRESSES = require('../helper/coreAssets.json');

// https://docs.hyperunit.xyz/developers/key-addresses

module.exports = {
  methodology: 'HyperUnit Hot wallets For BTC/ETH/SOL',
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.unitbtc }),
  },
  solana: {
    tvl: sumTokensExport({
      solOwners: ['9SLPTL41SPsYkgdsMzdfJsxymEANKr5bYoBsQzJyKpKS'],
      owners: ['9SLPTL41SPsYkgdsMzdfJsxymEANKr5bYoBsQzJyKpKS'],
      tokens: ['9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump', ADDRESSES.solana.PUMP, 'J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr', ADDRESSES.solana.BONK, 'J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd']
    })
  }
};

const config = {
  ethereum: { owner: '0xBEa9f7FD27f4EE20066F18DEF0bc586eC221055A'},
  monad: { owner: '0x4213de5c3C01eB3D757e271D4BEBc999F996E3D5'},
  plasma: { owner: '0x8e88826F42A0f5f199a9c91C3798c626326730b4'},
}

Object.keys(config).forEach(chain => {
  if (!config[chain].tokens) config[chain].tokens = [ADDRESSES.null]
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})