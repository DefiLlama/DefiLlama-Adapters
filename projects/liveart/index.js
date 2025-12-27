const sdk = require('@defillama/sdk')

async function computeMarketCap(api, assets, token) {
  const priceFeedAbi = 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
  const assetList = Array.isArray(assets) ? assets : [assets]

  const priceCalls = []
  const supplyCalls = []
  for (const asset of assetList) {
    priceCalls.push({ target: asset.priceFeed })
    supplyCalls.push({ target: asset.assetId })
  }

  const prices = await api.multiCall({
    abi: priceFeedAbi,
    calls: priceCalls,
  })

  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: supplyCalls,
  })

  for (let i = 0; i < assetList.length; i++) {
    const { answer: price } = prices[i]
    const totalSupply = supplies[i]
    const marketCap = (Number(totalSupply) / 1e18) * (Number(price) / 1e8)
    sdk.util.sumSingleBalance(api.getBalances(), token, marketCap)
  }

  return api.getBalances()
}

module.exports = {
  base: {
    tvl: async (api) => computeMarketCap(api, [{
      assetId: '0xcCa6848034d327fAc4D60126Ac6ee26708BDfe9d', // KOODOG Token
      priceFeed: '0x7B4dc9df689afbf5dDe58d474C229c3d2fb4cd85',
    }, {
      assetId: '0x25a0e808A7Ed833EA9e9C0B643Eb8B6832af3749', // MURFLO Token
      priceFeed: '0x6913A66f54DAe935fD489f34728D20aeEB43A6bB',
    }, {
      assetId: '0x1bb8da2A094078DdD91A1425afb29B0F5381b990', // BANGIR Token
      priceFeed: '0x5FD035D057f27fA6872E0D83F3F9C31665019b7A',
    }, {
      assetId: '0xf3b70e15743a9d94FE679891a4BfdA61183FD9f5', // KUSPUM Token
      priceFeed: '0x488Cd7e0D3CAE1fe5f52895DC0D255e9185F0f39',
    }], 'coingecko:usd-coin'),
  },
  bsc: {
    tvl: async (api) => computeMarketCap(api, [{
      assetId: '0x8c3b6Bf5078bE53B7462353218853129B642943C', // HOCPOOL Token
      priceFeed: '0x8eB682CdC4E7F913414274a54db1ca35bcC0c4bC',
    }, {
      assetId: '0x2024739806E4DEb480481150C45340fB800cB8fe', // MURFLO Token
      priceFeed: '0x102a2a121F6d54cCc137978642c6294a73c971d7',
    }, {
      assetId: '0xafE03Cf0833401c83C639566448fC4d754a52829', // HARPLA Token
      priceFeed: '0xAd49a5C7D8d8241588Da87821a51c83198cC3cd5',
    }, {
      assetId: '0x1bb8da2A094078DdD91A1425afb29B0F5381b990', // BANGIR Token
      priceFeed: '0x8eB682CdC4E7F913414274a54db1ca35bcC0c4bC',
    }, {
      assetId: '0xf3b70e15743a9d94FE679891a4BfdA61183FD9f5', // KUSPUM Token
      priceFeed: '0x8eB682CdC4E7F913414274a54db1ca35bcC0c4bC',
    },], 'coingecko:tether')
  },
  berachain: {
    tvl: async (api) => computeMarketCap(api, [{
      assetId: '0x25a0e808A7Ed833EA9e9C0B643Eb8B6832af3749', // MURFLO Token
      priceFeed: '0x0C0ccB0d5de18E0a208225585f0de4288D8dD2ff',
    }, {
      assetId: '0x1bb8da2A094078DdD91A1425afb29B0F5381b990', // BANGIR Token
      priceFeed: '0x638c575b1a374c84f0D11DaCeD349B2cC78E2f48',
    }, {
      assetId: '0xf3b70e15743a9d94FE679891a4BfdA61183FD9f5', // KUSPUM Token
      priceFeed: '0x638c575b1a374c84f0D11DaCeD349B2cC78E2f48',
    }], 'coingecko:tether')
  },
  linea: {
    tvl: async (api) => computeMarketCap(api, [{
      assetId: '0xf3b70e15743a9d94FE679891a4BfdA61183FD9f5', // KUSPUM Token
      priceFeed: '0xFB64a717319EBbB64f2dfC93d8E4316723eB8417',
    }], 'coingecko:usd-coin')
  },
};
