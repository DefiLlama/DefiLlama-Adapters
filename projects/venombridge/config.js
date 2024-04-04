const vaultAddress = "0x4aB740157721105aE503fbad756a578171512525";

const venomContracts = [
  {
    chain: "ethereum",
    address: "0x46f84dc6564cdd93922f7bfb88b03d35308d87c9",
    decimals: 9,
  },
  {
    chain: "bsc",
    address: "0x46f84dc6564cdd93922f7bfb88b03d35308d87c9",
    decimals: 9,
  },
  {
    chain: "fantom",
    address: "0x46f84dc6564cdd93922f7bfb88b03d35308d87c9",
    decimals: 9,
  },
  {
    chain: "polygon",
    address: "0x46f84dc6564cdd93922f7bfb88b03d35308d87c9",
    decimals: 9,
  },
  {
    chain: "avax",
    address: "0x46f84dc6564cdd93922f7bfb88b03d35308d87c9",
    decimals: 9,
  },
];

const tokens = {
  avax: [
    {
      coingeckoId: "avalanche-2",
      symbol: "AVAX",
      address: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      decimals: 18,
    },
    {
      coingeckoId: "weth",
      symbol: "WETH",
      address: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab",
      decimals: 18,
    },
    {
      coingeckoId: "wrapped-bitcoin",
      symbol: "WBTC",
      address: "0x50b7545627a5162F82A992c33b87aDc75187B218",
      decimals: 8,
    },
    {
      coingeckoId: "tether",
      symbol: "USDT",
      address: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
      decimals: 6,
    },
    {
      coingeckoId: "usd-coin",
      symbol: "USDC",
      address: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      decimals: 6,
    },
    {
      coingeckoId: "dai",
      symbol: "DAI",
      address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
      decimals: 18,
    },
    {
      coingeckoId: "web3world",
      symbol: "W3W",
      address: "0x9fdba0407d2044f53bd15b4696df3415b4d7e5c0",
      decimals: 9,
    },
  ],
  bsc: [
    {
      coingeckoId: "wbnb",
      symbol: "WBNB",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
    },
    {
      coingeckoId: "tether",
      symbol: "USDT",
      address: "0x55d398326f99059ff775485246999027b3197955",
      decimals: 18,
    },
    {
      coingeckoId: "usd-coin",
      symbol: "USDC",
      address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      decimals: 18,
    },
    {
      coingeckoId: "dai",
      symbol: "DAI",
      address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
      decimals: 18,
    },
    {
      coingeckoId: "weth",
      symbol: "WETH",
      address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      decimals: 18,
    },
    {
      coingeckoId: "wrapped-bitcoin",
      symbol: "WBTC",
      address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      decimals: 18,
    },
    {
      coingeckoId: "1art",
      symbol: "ONEART",
      address: "0xD3c325848D7c6E29b574Cb0789998b2ff901f17E",
      decimals: 18,
    },
    {
      coingeckoId: "yoshi-exchange",
      symbol: "YOSHI",
      address: "0x4374F26F0148a6331905eDf4cD33B89d8Eed78d1",
      decimals: 18,
    },
    {
      coingeckoId: "w3w",
      symbol: "W3W",
      address: "0x9fdba0407d2044f53bd15b4696df3415b4d7e5c0",
      decimals: 9,
    },
  ],
  ethereum: [
    {
      coingeckoId: "weth",
      symbol: "WETH",
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      decimals: 18,
    },
    {
      coingeckoId: "wrapped-bitcoin",
      symbol: "WBTC",
      address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      decimals: 8,
    },
    {
      coingeckoId: "tether",
      symbol: "USDT",
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      decimals: 6,
    },
    {
      coingeckoId: "usd-coin",
      symbol: "USDC",
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      decimals: 6,
    },
    {
      coingeckoId: "dai",
      symbol: "DAI",
      address: "0x6b175474e89094c44da98b954eedeac495271d0f",
      decimals: 18,
    },
    {
      coingeckoId: "w3w",
      symbol: "W3W",
      address: "0x9fdba0407d2044f53bd15b4696df3415b4d7e5c0",
      decimals: 9,
    },
  ],
  fantom: [
    {
      coingeckoId: "wrapped-fantom",
      symbol: "WFTM",
      address: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
      decimals: 18,
    },
    {
      coingeckoId: "yoshi-exchange",
      symbol: "YOSHI",
      address: "0x3dc57B391262e3aAe37a08D91241f9bA9d58b570",
      decimals: 18,
    },
    {
      coingeckoId: "1art",
      symbol: "ONEART",
      address: "0xD3c325848D7c6E29b574Cb0789998b2ff901f17E",
      decimals: 18,
    },
    {
      coingeckoId: "w3w",
      symbol: "W3W",
      address: "0x9fdba0407d2044f53bd15b4696df3415b4d7e5c0",
      decimals: 9,
    },
  ],
  polygon: [
    {
      coingeckoId: "wmatic",
      symbol: "WMATIC",
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      decimals: 18,
    },
    {
      coingeckoId: "wrapped-bitcoin",
      symbol: "WBTC",
      address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
      decimals: 8,
    },
    {
      coingeckoId: "weth",
      symbol: "WETH",
      address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
      decimals: 18,
    },
    {
      coingeckoId: "tether",
      symbol: "USDT",
      address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      decimals: 6,
    },
    {
      coingeckoId: "usd-coin",
      symbol: "USDC",
      address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
      decimals: 6,
    },
    {
      coingeckoId: "dai",
      symbol: "DAI",
      address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      decimals: 18,
    },
    {
      coingeckoId: "w3w",
      symbol: "W3W",
      address: "0x9fdba0407d2044f53bd15b4696df3415b4d7e5c0",
      decimals: 9,
    },
  ],
};

module.exports = {
  vaultAddress,
  venomContracts,
  tokens,
};
