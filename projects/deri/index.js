const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi");

async function perpetualPool(api, pool) {
  const res = await api.call({ target: pool, abi: abi.getLengths, });
  const calls = []
  for (let i = 0; i < res[0]; i++)
    calls.push(i)
  const tokenData = await api.multiCall({ abi: abi.getBToken, calls, target: pool, });
  const tokens = tokenData.map((t) => t.bTokenAddress);
  return api.sumTokens({ owner: pool, tokens })
}

let config = {
  arbitrum: {
    futureMain: { bTokenSymbol: ADDRESSES.arbitrum.USDC, pool: "0xDE3447Eb47EcDf9B5F90E7A6960a14663916CeE8", v3: true, },
  },
  era: {
    futureMain: { bTokenSymbol: ADDRESSES.era.USDC, pool: "0x9F63A5f24625d8be7a34e15477a7d6d66e99582e", v3: true, },
  },
  polygon: {
    a: { pool: "0x4Db087225C920Bec55B2dCEAa629BDc5782623D9", },
    b: { bTokenSymbol: ADDRESSES.polygon.USDT, pool: "0xA8769A4Fb0Ca82eb474448B1683DCA3c79798B69", lite: true, },
    deriPool: { bTokenSymbol: "0x3d1d2afd191b165d140e3e8329e634665ffb0e5e", pool: "0xdDfCA16Cd80Ae3aeeb7C7ef743924Ac39A94cC9c", lite: true, },
  },
  bsc: {
    a: { pool: "0x66f501dda450C8978c4A1115D7b2A7FAa7702F05", },
    b: { bTokenSymbol: ADDRESSES.bsc.BUSD, pool: "0x574022307e60bE1f07da6Ec1cB8fE23d426e5831", lite: true, },
    everlastingOption: { bTokenSymbol: ADDRESSES.bsc.BUSD, pool: "0x08aD0E0b4458183758fC5b9b6D27c372965fB780", lite: true, },
    deriPool: { bTokenSymbol: "0xe60eaf5a997dfae83739e035b005a33afdcc6df5", pool: "0x26bE73Bdf8C113F3630e4B766cfE6F0670Aa09cF", lite: true, },
    option: { bTokenSymbol: ADDRESSES.bsc.BUSD, pool: "0x243681B8Cd79E3823fF574e07B2378B8Ab292c1E", v3: true, },
    futureMain: { bTokenSymbol: ADDRESSES.bsc.BUSD, pool: "0x4ad5cb09171275A4F4fbCf348837c63a91ffaB04", v3: true, },
    futureInno: { bTokenSymbol: ADDRESSES.bsc.BUSD, pool: "0xD2D950e338478eF7FeB092F840920B3482FcaC40", v3: true, },
  },
}

async function v3Pool(api, pool, bToken) {
  let liquidity = await api.call({ target: pool, abi: abi["v3Liquidity"], })
  const decimals = await api.call({ abi: 'erc20:decimals', target: bToken })
  api.add(bToken, liquidity * (10 ** (decimals - 18)))
}

Object.keys(config).forEach(chain => {
  const contracts = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokensAndOwners = []
      for (let { pool, bTokenSymbol, v3, lite } of Object.values(contracts)) {
        if (lite)
          tokensAndOwners.push([bTokenSymbol, pool]);
        else if (v3)
          await v3Pool(api, pool, bTokenSymbol)
        else
          await perpetualPool(api, pool)
      }
      return api.sumTokens({ tokensAndOwners });
    }
  }
})