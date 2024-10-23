const ITVL = {
  pool2: "uint256:pool2",
  staking: "uint256:staking",
  tvl: "uint256:tvl",
}

//	TvlGuru:	On-Chain Universal TVL Finder
const tvlGuru = {
  "fantom": "0x0786c3a78f5133F08C1c70953B8B10376bC6dCad",
  "kcc": "0x426a4A4B73d4CD173C9aB78d18c0d79d1717eaA9",
  "multivac": "0xe345A50C33e5c9D0284D6fF0b891c4Fc99a9C117",
  "echelon": "0xa254bfd74c38b26145b980162fb1a49bc0a4f14b",
  "metis": "0x50Dcc6cb1B2d6965c42d98a2b07629c57a6be895",
  "bsc": "0xD600Ec98cf6418c50EE051ACE53219D95AeAa134",
  "arbitrum": "0xFAB311FE3E3be4bB3fEd77257EE294Fb22Fa888b",
  "avax": "0xFAB311FE3E3be4bB3fEd77257EE294Fb22Fa888b",
  "polygon" : "0x18C7AD880A07D363f2d034a8523ae34b8068845a"
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "USD-denominated value aggregation of most Locked assets held across Guru Network's smart contracts across multiple chains, powered by direct on-chain storage of quantity, pools and prices using ftm.guru's Universal TVL Finder Tool (tvlGuru.sol). More detailed documentation of TVL is available at https://ftm.guru/rawdata/tvl and https://ftm.guru/docs.",
}

Object.entries(tvlGuru).forEach(([chain, target]) => {
  module.exports[chain] = {
    // pool2: async (api) => ({ tether: ((await api.call({ target, abi: ITVL.pool2 }))) / 1e18 }),
    // staking: async (api) => ({ tether: ((await api.call({ target, abi: ITVL.staking}))) / 1e18 }),
    tvl: async (api) => ({ tether: ((await api.call({ target, abi: ITVL.tvl }))) / 1e18 }),
  }
})

module.exports.echelon.tvl = () => ({})