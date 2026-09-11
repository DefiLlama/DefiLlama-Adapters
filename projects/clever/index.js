const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const commonAbi = require("./abis/index.json")
const tokens = {
    BalancerContract: '0xba12222222228d8ba445958a75a0704d566bf2c8'
};
const pools = [
    {
        name: 'CLEV/ETH',
        fromPlatform: "Curve",
        addresses: {
            lpToken: '0x6C280dB098dB673d30d5B34eC04B6387185D3620',
            gauge: '0x86e917ad6Cb44F9E6C8D9fA012acF0d0CfcF114f',
        },
    },
    {
        name: 'clevCVX/CVX',
        fromPlatform: "Curve",
        addresses: {
            lpToken: '0xF9078Fb962A7D13F55d40d49C8AA6472aBD1A5a6',
            gauge: '0xF758BE28E93672d1a8482BE15EAf21aa5450F979',
        },
    },
    {

        name: 'clevCVX/CVX',
        fromPlatform: "Balancer",
        addresses: {
            lpToken: '0xf9078fb962a7d13f55d40d49c8aa6472abd1a5a6',
            gauge: '0x9b02548De409D7aAeE228BfA3ff2bCa70e7a2fe8',
        },
    },
    {

        name: 'abcCVX',
        fromPlatform: "Curve",
        addresses: {
            lpToken: '0xDEC800C2b17c9673570FDF54450dc1bd79c8E359',
            gauge: '0xc5022291cA8281745d173bB855DCd34dda67F2f0',
        },
    },
]
const clevers = [
    {
        name: 'Frax-USDC',
        indice: 1,
        metaCleverAddress: '0xEB0ea9D24235aB37196111eeDd656D56Ce4F53b1',
    },
    {
        name: 'LUSDFraxBP',
        indice: 0,
        metaCleverAddress: '0xb2Fcee71b25B62baFE442c58AF58c42143673cC1',
    },
    {
        name: 'TUSDFraxBP',
        indice: 0,
        metaCleverAddress: '0xad4caC207A0BFEd10dF8A4FC6A28D377caC730E0',
    },
    {
        name: 'clevUSDFRAXBP',
        indice: 0,
        metaCleverAddress: '0x2C37F1DcEd208530A05B061A183d8937F686157e',
    },
]
const config = { pools, tokens, clevers };

const lockCvxAddress = '0x96C68D861aDa016Ed98c30C810879F9df7c64154';

async function pool2(_, _1, _2, { api, balances = {}}) {
  const gaugeTotalSupplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: config.pools.map(i => ({ target: i.addresses.gauge })),
  })
  gaugeTotalSupplies.forEach((item, i) => {
    const lpToken = config.pools[i].addresses.lpToken
    sdk.util.sumSingleBalance(balances, lpToken, item, api.chain)
  })
  return balances
}

async function getClevers(balances, api) {
  const yieldStrategiesInfos = await api.multiCall({
    abi: commonAbi.yieldStrategies,
    calls: config.clevers.map(i => ({ target: i.metaCleverAddress, params: i.indice })),
  })
  yieldStrategiesInfos.forEach((item, i) => {
    const underlyingToken = item.underlyingToken
    const underlying = item.expectedUnderlyingTokenAmount
    sdk.util.sumSingleBalance(balances, underlyingToken, underlying, api.chain)
  })
}

async function tvl(api) {
  let balances = {}
  const [totalLockedGlobal] = await Promise.all([
    api.call({
      target: lockCvxAddress,
      abi: "uint128:totalLockedGlobal",
    }),
    getClevers(balances, api),
  ])
  sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.CVX, totalLockedGlobal)
  return balances
}

module.exports = {
  ethereum: {
    tvl,
    pool2,
  }
}
