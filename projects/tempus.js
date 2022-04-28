const sdk = require("@defillama/sdk");

const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const YFI = "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const CHAIN_DATA = {
  ethereum: {
    stats: "0xe552369a1b109b1eeebf060fcb6618f70f9131f7",
    pools: [
      {
        address: "0x6320E6844EEEa57343d5Ca47D3166822Ec78b116",
        token: WETH
      },
      {
        address: "0x0697B0a2cBb1F947f51a9845b715E9eAb3f89B4F",
        token: WETH
      },
      {
        address: "0xc58b8DD0075f7ae7B1CF54a56F899D8b25a7712E",
        token: USDC
      },
      {
        address: "0x443297DE16C074fDeE19d2C9eCF40fdE2f5F62C2",
        token: USDC
      },
      {
        address: "0x7e0fc07280f47bac3D55815954e0f904c86f642E",
        token: DAI
      }
    ]
  },
  fantom: {
    stats: "0x7008d1f94088c8AA012B4F370A4fe672ad592Ee3",
    pools: [
      {
        address: "0x9c0273E4abB665ce156422a75F5a81db3c264A23",
        token: DAI
      },
      {
        address: "0x943B73d3B7373de3e5Dd68f64dbf85E6F4f56c9E",
        token: USDC
      },
      {
        address: "0xE9b557f9766Fb20651E3685374cd1DF6f977d36B",
        token: USDT
      },
      {
        address: "0xA9C549aeFa21ee6e79bEFCe91fa0E16a9C7d585a",
        token: WETH
      },
      {
        address: "0xAE7E5242eb52e8a592605eE408268091cC8794b8",
        token: YFI
      }
    ]
  }
}


async function tvl(chain, timestamp, block) {
  const { stats, pools } = CHAIN_DATA[chain];
  let balances = {};
  const lockedBalances = (
    await sdk.api.abi.multiCall({
      abi: { "inputs": [ { "internalType": "contract ITempusPool", "name": "pool", "type": "address" } ], "name": "totalValueLockedInBackingTokens", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      calls: pools.map((p) => ({
        target: stats,
        params: [p.address],
      })),
      block,
      chain
    })
  ).output;

  for (let i = 0; i < pools.length; i++) {
    sdk.util.sumSingleBalance(
      balances,
      pools[i].token,
      lockedBalances[i].output
    );
  }
  
  return balances;
}

module.exports = {
  methodology: `All assets that were deposited into our active pools.`,
  ethereum: {
    tvl: tvl.bind(null, "ethereum"),
  },
  fantom: {
    tvl: tvl.bind(null, "fantom")
  }
};
