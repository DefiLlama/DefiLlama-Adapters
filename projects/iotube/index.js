const ADDRESSES = require('../helper/coreAssets.json')
const { request, gql } = require("graphql-request");

const apiURL = "https://smart-graph.iotex.me/iotube/graphql";

const query = gql`
  query (
    $iotexTokens: [String!]!
    $ethTokens: [String!]!
    $bscTokens: [String!]!
    $polygonTokens: [String!]!
  ) {
    iotex: IoTeX {
      chainId
      CIOTX: ERC20(address: [ADDRESSES.iotex.CIOTX]) {
        address
        symbol
        decimals
        totalSupply
        balance: market_cap
      }
      CYC: ERC20(address: [ADDRESSES.iotex.CYC]) {
        address
        symbol
        decimals
        totalSupply
        balance: market_cap
      }
      Tokens: ERC20(address: $iotexTokens) {
        address
        symbol
        decimals
        totalSupply
        balance: market_cap
      }
      TokenSafe: ERC20(
        address: [ADDRESSES.iotex.WIOTX]
      ) {
        address
        symbol
        decimals
        balance: balanceUSD(account: "0xc4a29a94f12be03033daa4e6ce9b9678c26275a2")
      }
    }
    ethereum: ETH {
      chainId
      CYC: ERC20(address: ["0x8861cfF2366C1128fd699B68304aD99a0764Ef9a"]) {
        address
        symbol
        decimals
        totalSupply
				balance: market_cap
      }
      TokenSafe: ERC20(address: $ethTokens) {
        address
        symbol
        decimals
        balance: balanceUSD(account: "0xc2e0f31d739cb3153ba5760a203b3bd7c27f0d7a")
      }
    }
    bsc: BSC {
      chainId
      CIOTX: ERC20(address: ["0x2aaF50869739e317AB80A57Bf87cAA35F5b60598"]) {
        address
        symbol
        decimals
        totalSupply
        balance: market_cap
      }
      CYC: ERC20(address: ["0x810ee35443639348adbbc467b33310d2ab43c168"]) {
        address
        symbol
        decimals
        totalSupply
        balance: market_cap
      }
      TokenSafe: ERC20(address: $bscTokens) {
        address
        symbol
        decimals
        balance: balanceUSD(account: "0xfbe9a4138afdf1fa639a8c2818a0c4513fc4ce4b")
      }
    }
    polygon: Polygon {
      chainId
      CIOTX: ERC20(address: ["0x300211Def2a644b036A9bdd3e58159bb2074d388"]) {
        address
        symbol
        decimals
        totalSupply
        balance: market_cap
      }
      CYC: ERC20(address: ["0xcFb54a6D2dA14ABeCD231174FC5735B4436965D8"]) {
        address
        symbol
        decimals
        totalSupply
        balance: market_cap
        
      }
      TokenSafe: ERC20(address: $polygonTokens) {
        address
        symbol
        decimals
        balance: balanceUSD(account: "0xa239f03cda98a7d2aaaa51e7bf408e5d73399e45")
      }
    }
  }
`;

const variables = {
  iotexTokens: [
    ADDRESSES.iotex.ioETH,
    ADDRESSES.iotex.ioWBTC,
    ADDRESSES.iotex.ioBUSD,
    "0xedeefaca6a1581fe2349cdfc3083d4efa8188e55",
    "0x2a6003e4b618ff3457a4a2080d028b0249b51c80",
    ADDRESSES.iotex.ioUSDT,
    ADDRESSES.iotex.ioUSDC,
    ADDRESSES.iotex.ioDAI,
    ADDRESSES.iotex.BNB_bsc,
    ADDRESSES.iotex.BUSD_bsc,
    ADDRESSES.iotex.USDT_b,
    ADDRESSES.iotex.USDC_b,
    "0x0bDF82F276309E2efd4947Ee8E0A248b2726E8Df",
    ADDRESSES.iotex.WMATIC,
    "0x653656f84381e8a359a268f3002621bbb14c62f8",
    "0x7f0ad63c902c67b1fa1b1102b0daffb889f5d5cb",
    ADDRESSES.iotex.DAI_matic,
    ADDRESSES.iotex.USDT_matic,
    ADDRESSES.iotex.USDC_matic,
    "0x295ebb8c782e186bcb70d9a8124053043d1adf5c",
    "0xe46ba98a87dca989725e9a2389975c0bbbb8f985",
    "0xaadc74127109d944e36cbd70f71fc5f0c921fc6c",
    "0x0499a3ec965136bea01e4350113a2105724785dc",
    "0x28873cEA8c26F603b15937f9985A888C5DA5Fd90",
    "0xc1B58620aD839383c662BFe80dB4514344DeC6d7",
  ],
  ethTokens: [
    "0x6fb3e0a217407efff7ca062d46c26e5d60a14d69",
    ADDRESSES.ethereum.WETH,
    "0x6fb3e0a217407efff7ca062d46c26e5d60a14d69",
    ADDRESSES.ethereum.WBTC,
    "0x8861cfF2366C1128fd699B68304aD99a0764Ef9a",
    ADDRESSES.ethereum.BUSD,
    ADDRESSES.ethereum.UNI,
    "0x45804880de22913dafe09f4980848ece6ecbaf78",
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.DAI,
    "0xD227c3e4f3F8dE94180269eF9DC221a6efc1F4C4",
    "0xf79deaBc1406a3AD07c70877fBaEb90777B77E68",
  ],
  bscTokens: [
    ADDRESSES.bsc.WBNB,
    ADDRESSES.bsc.BUSD,
    "0x810ee35443639348adbbc467b33310d2ab43c168",
    "0x2aaF50869739e317AB80A57Bf87cAA35F5b60598",
    ADDRESSES.bsc.USDT,
    ADDRESSES.bsc.USDC,
    "0x7e544f2fEDDc69b1cB12555779c824CFe100ee34",
    "0x049Dd7532148826CdE956c7B45fec8c30b514052",
    "0x049Dd7532148826CdE956c7B45fec8c30b514052",
    "0xab951271F025D93c278516e3d131e017e8a3089D",
  ],
  polygonTokens: [
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    ADDRESSES.polygon.WETH_1,
    ADDRESSES.polygon.WBTC,
    ADDRESSES.polygon.DAI,
    ADDRESSES.polygon.USDT,
    ADDRESSES.polygon.USDC,
    "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a",
    "0x831753DD7087CaC61aB5644b308642cc1c33Dc13",
    "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
    "0xcFb54a6D2dA14ABeCD231174FC5735B4436965D8",
    "0x300211Def2a644b036A9bdd3e58159bb2074d388",
  ],
};
let cache = null;

const loadTvl = async () => {
  const result = cache
    ? cache
    : await request(apiURL, query, variables).then(
        (res) => {
          Object.entries(res).forEach(([k, v]) => {
            res[k] = [
              ...(v.CIOTX?.filter((i) => i.balance > 0).map((i) =>
                Number(i.balance)
              ) || []),
              ...(v.Tokens?.filter((i) => i.balance > 0).map((i) =>
                Number(i.balance)
              ) || []),
              ...(v.CYC?.filter((i) => i.balance > 0).map((i) =>
                Number(i.balance)
              ) || []),
              ...(v.TokenSafe?.filter((i) => i.balance > 0).map((i) =>
                Number(i.balance)
              ) || []),
            ].reduce((acc, i) => acc + i, 0)
            if (!cache) cache = {};
            cache[res] = res[k];
          });
          return res;
        }
      );
  return result;
};

const allChains = ["iotex", "ethereum", "bsc", "polygon"].reduce((p, c) => {
  p[c] = {
    fetch: async () => {
      const tvl = await loadTvl();
      return tvl[c];
    },
  };
  return p;
}, {});

module.exports = {
  ...allChains,
  fetch: async () => {
    const tvl = await loadTvl();
    return Object.values(tvl).reduce((acc, i) => acc + i, 0)
  },
  hallmarks:[
    [1651881600, "UST depeg"],
  ],
};
