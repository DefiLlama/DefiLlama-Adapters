const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')
const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)';
const stableSwapAbi = require('./abis/StableSwap.json');


function getStableSwapPool(contracts) {
  return async (api) => {
    const tokensArray = await api.multiCall({ abi: stableSwapAbi.getTokens, calls: contracts })
    const balsArray = await api.multiCall({ abi: stableSwapAbi.getTokenBalances, calls: contracts })
    tokensArray.map((v, i) => api.addTokens(v, balsArray[i]))
    return api.getBalances()
  }
}

const MoonriverStableSwapContractAddress = [
  "0x7BDE79AD4ae9023AC771F435A1DC6efdF3F434D1", // USDT/USDC/xcAUSD/FRAX
  "0xd38A007F60817635163637411353BB1987209827", // xcKSM/stKSM
];

const MoonbeamStableSwapContractAddress = [
  '0x68bed2c54Fd0e6Eeb70cFA05723EAE7c06805EC5', // 4pool
];

const AstarStableSwapContractAddress = [
  '0xb0Fa056fFFb74c0FB215F86D691c94Ed45b686Aa', // 4pool
];

const uniArgs = {
  useDefaultCoreAssets: true, abis: { getReserves }, blacklistedTokens: [
    MoonbeamStableSwapContractAddress,
    MoonriverStableSwapContractAddress,
    AstarStableSwapContractAddress,
  ].flat()
}

module.exports = {
  methodology: "Get all pairs from the Factory Contract then get the reserve0 token amount and reserve1 token amount in one pair. Update the total balance of each token by reserve0 and reserve1. Repeat 2 ~ 3 for each pairs.",
  misrepresentedTokens: true,
  moonriver: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({ factory: '0xf36AE63d89983E3aeA8AaaD1086C3280eb01438D', ...uniArgs, }),
      getUniTVL({ factory: '0x28Eaa01DC747C4e9D37c5ca473E7d167E90F8d38', ...uniArgs, }),
      getStableSwapPool(MoonriverStableSwapContractAddress),
    ])
  },
  moonbeam: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({ factory: '0xF49255205Dfd7933c4D0f25A57D40B1511F92fEF', ...uniArgs, }),
      getUniTVL({ factory: '0x079710316b06BBB2c0FF4bEFb7D2DaC206c716A0', ...uniArgs, }),
      getStableSwapPool(MoonbeamStableSwapContractAddress),
    ])
  },
  astar: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({ factory: '0x7BAe21fB8408D534aDfeFcB46371c3576a1D5717', ...uniArgs, }),
      getStableSwapPool(AstarStableSwapContractAddress),
    ])
  },
}
