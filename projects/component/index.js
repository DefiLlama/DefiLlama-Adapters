const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const cmp = "0x9f20Ed5f919DC1C1695042542C13aDCFc100dcab";
const ethStakingPool = "0x79876b5062160C107e02826371dD33c047CCF2de";


const ethPools = [
  //POOLS
  {
    token: "0x49519631B404E06ca79C9C7b0dC91648D86F08db",
    underlying: [
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDC,
    ]
  },
  {
    token: "0x6477960dd932d29518D7e8087d5Ea3D11E606068",
    underlying: [
      "0x1456688345527bE1f37E9e627DA0837D6f08C925",
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.sUSD
    ]
  }
];

const xDaiPools = [
  //POOLS
  {
    token: "0x53De001bbfAe8cEcBbD6245817512F8DBd8EEF18",
    underlying: [
      ADDRESSES.xdai.USDC,
      ADDRESSES.xdai.WXDAI
    ]
  },
  {
    token: "0xF82fc0ecBf3ff8e253a262447335d3d8A72CD028",
    underlying: [
      "0xFc8B2690F66B46fEC8B3ceeb95fF4Ac35a0054BC",
      ADDRESSES.xdai.WXDAI
    ]
  },
  {
    token: "0xfbbd0F67cEbCA3252717E66c1Ed1E97ad8B06377",
    underlying: [
      ADDRESSES.xdai.USDC,
      "0xFc8B2690F66B46fEC8B3ceeb95fF4Ac35a0054BC",
      "0xD10Cc63531a514BBa7789682E487Add1f15A51E2",
      ADDRESSES.xdai.WXDAI
    ]
  }
]

const bscPools = [
  //POOLS
  {
    token: "0xcf76a0ceDf50DA184FDef08A9d04E6829D7FefDF",
    underlying: [
      ADDRESSES.bsc.USDT,
      ADDRESSES.bsc.BUSD,
    ]
  },
  {
    token: "0x3Bb6Bf6EcBC71f8f78D1Eec9c91de4f8Fd5C891c",
    underlying: [
      ADDRESSES.bsc.USDT,
      ADDRESSES.bsc.BUSD,
      ADDRESSES.bsc.USDC
    ]
  }
]

const config = {
  ethereum: ethPools,
  xdai: xDaiPools,
  bsc: bscPools,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = config[chain].map(p => [p.underlying, p.token])
      return api.sumTokens({ ownerTokens})
    }
  }
})
module.exports.ethereum.staking = staking(ethStakingPool, cmp)