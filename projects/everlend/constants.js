const {PublicKey} = require("@solana/web3.js");

const POOL_MARKET_PUBKEY = new PublicKey ('DzGDoJHdzUANM7P7V25t5nxqbvzRcHDmdhY51V6WNiXC')

const POOLS = {
  usdc: '34xM6YkjPk7upi2xeR4m7jfjEZLb7nw6Ur5fsssdz7pL',
  usdt: 'J4bURkzypWzyw8H6HDvY7kKAfv6iJFEsZBpw72sqAgof',
  ust: '7zmmBqxNzfWxUgMEPjcSbUcfaBMd2UhzxD5wR3zMHgR7',
  sol: 'BGGStG5GJtqDyRGButk1KKVpEaEphjvYykPR5sT4MCLP',
  msol: 'CRSZvbcMNgE5E98JvEjgVBYB7AQimiSFxcWALCifntfo',
  stsol: '3iGgoHnC2b2eoZ3KrxjfP3j3SoZsb8szpDLVKmFdpTNR',
  btc: '3NgoccSHHyLXQMP3KoPLXgyCGXrETJkBE1w5wKE6Zbky',
  eth: '6y35H1eibtN2yunXHuKsfUDDriTdwVvNGQF294A7C6EK',
  ftt: '3xrs5krW9hxdhLvxJBNRAXNcTzXjSacbJW9sB4H5WYm8',
  ray: '6zcDbi9QBj92W3h5R6XjTUuhayPxwtfGGp89zT1naEGf',
  srm: 'GSTwFFFu2i45ZN2hDXYbTU7ixratjaq8j1eH75949mRj',
}

const TOKENS_META_DATA = {
  [POOLS.usdc]: {
    name: 'usd-coin',
  },
  [POOLS.usdt]: {
    name: 'tether',
  },
  [POOLS.ust]: {
    name: 'terrausd',
  },
  [POOLS.sol]: {
    name: 'solana',
  },
  [POOLS.msol]: {
    name: 'msol',
  },
  [POOLS.stsol]: {
    name: 'lido-staked-sol',
  },
  [POOLS.btc]: {
    name: 'bitcoin',
  },
  [POOLS.eth]: {
    name: 'ethereum',
  },
  [POOLS.ftt]: {
    name: 'ftx-token',
  },
  [POOLS.ray]: {
    name: 'raydium',
  },
  [POOLS.srm]: {
    name: 'serum',
  },
}


module.exports = {
  POOL_MARKET_PUBKEY,
  TOKENS_META_DATA,
}
