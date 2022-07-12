const retry = require("../helper/retry");
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
      CIOTX: ERC20(address: ["0x99B2B0eFb56E62E36960c20cD5ca8eC6ABD5557A"]) {
        address
        symbol
        decimals
        totalSupply
        balance: market_cap
      }
      CYC: ERC20(address: ["0x4d7b88403aa2f502bf289584160db01ca442426c"]) {
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
        address: ["0xa00744882684c3e4747faefd68d283ea44099d03"]
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
    "0x0258866edaf84d6081df17660357ab20a07d0c80",
    "0xc7b93720f73b037394ce00f954f849ed484a3dea",
    "0xacee9b11cd4b3f57e58880277ac72c8c41abe4e4",
    "0xedeefaca6a1581fe2349cdfc3083d4efa8188e55",
    "0x2a6003e4b618ff3457a4a2080d028b0249b51c80",
    "0x6fbCdc1169B5130C59E72E51Ed68A84841C98cd1",
    "0x3B2bf2b523f54C4E454F08Aa286D03115aFF326c",
    "0x1CbAd85Aa66Ff3C12dc84C5881886EEB29C1bb9b",
    "0x97e6c48867fdc391a8dfe9d169ecd005d1d90283",
    "0x84abcb2832be606341a50128aeb1db43aa017449",
    "0x42C9255D5e522e83B16ea11a3BA04c2D3AfCA079",
    "0x037346E5a5722957Ac2cAb6ceb8c74fC18Cea91D",
    "0x0bDF82F276309E2efd4947Ee8E0A248b2726E8Df",
    "0x8e66c0d6b70c0b23d39f4b21a1eac52bba8ed89a",
    "0x653656f84381e8a359a268f3002621bbb14c62f8",
    "0x7f0ad63c902c67b1fa1b1102b0daffb889f5d5cb",
    "0x62a9d987cbf4c45a550deed5b57b200d7a319632",
    "0x3cdb7c48e70b854ed2fa392e21687501d84b3afc",
    "0xc04da3a99d17135857bb937d2fbb321d3b6c6a81",
    "0x295ebb8c782e186bcb70d9a8124053043d1adf5c",
    "0xe46ba98a87dca989725e9a2389975c0bbbb8f985",
    "0xaadc74127109d944e36cbd70f71fc5f0c921fc6c",
    "0x0499a3ec965136bea01e4350113a2105724785dc",
    "0x28873cEA8c26F603b15937f9985A888C5DA5Fd90",
    "0xc1B58620aD839383c662BFe80dB4514344DeC6d7",
  ],
  ethTokens: [
    "0x6fb3e0a217407efff7ca062d46c26e5d60a14d69",
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "0x6fb3e0a217407efff7ca062d46c26e5d60a14d69",
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    "0x8861cfF2366C1128fd699B68304aD99a0764Ef9a",
    "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    "0x45804880de22913dafe09f4980848ece6ecbaf78",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "0x6b175474e89094c44da98b954eedeac495271d0f",
    "0xD227c3e4f3F8dE94180269eF9DC221a6efc1F4C4",
    "0xf79deaBc1406a3AD07c70877fBaEb90777B77E68",
  ],
  bscTokens: [
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    "0x810ee35443639348adbbc467b33310d2ab43c168",
    "0x2aaF50869739e317AB80A57Bf87cAA35F5b60598",
    "0x55d398326f99059ff775485246999027b3197955",
    "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    "0x7e544f2fEDDc69b1cB12555779c824CFe100ee34",
    "0x049Dd7532148826CdE956c7B45fec8c30b514052",
    "0x049Dd7532148826CdE956c7B45fec8c30b514052",
    "0xab951271F025D93c278516e3d131e017e8a3089D",
  ],
  polygonTokens: [
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
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
    : await retry(async (fail) => await request(apiURL, query, variables)).then(
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
};
