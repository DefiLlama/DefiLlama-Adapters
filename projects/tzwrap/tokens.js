const ADDRESSES = require('../helper/coreAssets.json')
// info taken from https://indexer.app.tzwrap.com/v1/configuration

module.exports = [
  {
    "ethereumSymbol": "LEO",
    "ethereumName": "Bitfinex LEO Token",
    "ethereumContractAddress": "0x2af5d2ad76741191d15dfe7bf6ac92d4bd912ca3",
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "BUSD",
    "ethereumName": "Binance USD",
    "ethereumContractAddress": ADDRESSES.ethereum.BUSD,
    "tezosWrappingContract": ADDRESSES.tezos.WETH_e
  },
  {
    "ethereumSymbol": "LINK",
    "ethereumName": "ChainLink Token",
    "ethereumContractAddress": ADDRESSES.ethereum.LINK,
    "tezosWrappingContract": ADDRESSES.tezos.WETH_e
  },
  {
    "ethereumSymbol": "DAI",
    "ethereumName": "Dai Stablecoin",
    "ethereumContractAddress": ADDRESSES.ethereum.DAI,
    "tezosWrappingContract": ADDRESSES.tezos.WETH_e
  },
  {
    "ethereumSymbol": "SUSHI",
    "ethereumName": "SushiToken",
    "ethereumContractAddress": ADDRESSES.ethereum.SUSHI,
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "HT",
    "ethereumName": "Huobi Token",
    "ethereumContractAddress": "0x6f259637dcd74c767781e37bc6133cd6a68aa161",
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "OKB",
    "ethereumName": "OKB",
    "ethereumContractAddress": "0x75231f58b43240c9718dd58b4967c5114342a86c",
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "AAVE",
    "ethereumName": "Aave Token",
    "ethereumContractAddress": ADDRESSES.ethereum.AAVE,
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "PAX",
    "ethereumName": "Paxos Standard",
    "ethereumContractAddress": "0x8e870d67f660d95d5be530380d0ec0bd388289e1",
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "MKR",
    "ethereumName": "Maker",
    "ethereumContractAddress": ADDRESSES.ethereum.MKR,
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "HUSD",
    "ethereumName": "HUSD",
    "ethereumContractAddress": "0xdf574c24545e5ffecb9a659c229253d4111d87e1",
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "UNI",
    "ethereumName": "Uniswap",
    "ethereumContractAddress": ADDRESSES.ethereum.UNI,
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "WBTC",
    "ethereumName": "Wrapped BTC",
    "ethereumContractAddress": ADDRESSES.ethereum.WBTC,
    "tezosWrappingContract": ADDRESSES.tezos.WETH_e
  },
  {
    "ethereumSymbol": "FTT",
    "ethereumName": "FTX Token",
    "ethereumContractAddress": "0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9",
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "MATIC",
    "ethereumName": "Matic Token",
    "ethereumContractAddress": ADDRESSES.ethereum.MATIC,
    "tezosWrappingContract": ADDRESSES.tezos.WETH_e
  },
  {
    "ethereumSymbol": "CRO",
    "ethereumName": "Crypto.com Coin",
    "ethereumContractAddress": "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b",
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "USDC",
    "ethereumName": "USD Coin",
    "ethereumContractAddress": ADDRESSES.ethereum.USDC,
    "tezosWrappingContract": ADDRESSES.tezos.WETH_e
  },
  {
    "ethereumSymbol": "CEL",
    "ethereumName": "Celsius Network",
    "ethereumContractAddress": "0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d",
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "COMP",
    "ethereumName": "Compound",
    "ethereumContractAddress": "0xc00e94cb662c3520282e6f5717214004a7f26888",
    "tezosWrappingContract": ADDRESSES.tezos.AAVE
  },
  {
    "ethereumSymbol": "WETH",
    "ethereumName": "Wrapped Ether",
    "ethereumContractAddress": ADDRESSES.ethereum.WETH,
    "tezosWrappingContract": ADDRESSES.tezos.WETH_e
  },
  {
    "ethereumSymbol": "USDT",
    "ethereumName": "Tether USD",
    "ethereumContractAddress": ADDRESSES.ethereum.USDT,
    "tezosWrappingContract": ADDRESSES.tezos.WETH_e
  }
]