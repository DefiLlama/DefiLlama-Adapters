const sdk = require("@defillama/sdk")
const ITVL = [
  {
    "inputs": [],
    "name": "pool2",   //POOL2 TVL : 1e18 === 1 USD
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "staking",   //STAKING TVL : 1e18 === 1 USD
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tvl",   //GLOABL TVL : 1e18 === 1 USD
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usd",   //On-chain USD Reference Token
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

//	TvlGuru:	On-Chain Universal TVL Finder
const tvlGuru = { 
  "fantom": "0x0786c3a78f5133F08C1c70953B8B10376bC6dCad",
  "kcc": "0x426a4A4B73d4CD173C9aB78d18c0d79d1717eaA9",
  "multivac": "0xe345A50C33e5c9D0284D6fF0b891c4Fc99a9C117",
  "echelon": "0x5C652A94c672f8F6D021417bB5eE75c322ecf1Fc",
  "metis": "0x50Dcc6cb1B2d6965c42d98a2b07629c57a6be895"
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "USD-denominated value aggregation of most Locked assets held across Guru Network's & Kompound Protocol's smart contracts across multiple chains, powered by direct on-chain storage of quantity, pools and prices using ftm.guru's Universal TVL Finder Tool (tvlGuru.sol). More detailed documentation of TVL is available at https://ftm.guru/rawdata/tvl",
}

Object.keys(tvlGuru).forEach(chain => {
  const callArgs = { target: tvlGuru[chain], chain, }
  module.exports[chain] = {
    pool2: async (_, _b, { [chain]: block }) => ({ tether: ((await sdk.api.abi.call({ ...callArgs, abi: ITVL[0], block })).output) / 1e18 }),
    staking: async (_, _b, { [chain]: block }) => ({ tether: ((await sdk.api.abi.call({ ...callArgs, abi: ITVL[1], block })).output) / 1e18 }),
    tvl: async (_, _b, { [chain]: block }) => ({ tether: ((await sdk.api.abi.call({ ...callArgs, abi: ITVL[2], block })).output) / 1e18 }),
  }
})
