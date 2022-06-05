const sdk = require("@defillama/sdk")
const abi = require('./abi')
const { sumTokensSingle } = require('../helper/unknownTokens')

const chain = 'bsc'
const vault = '0x7ee058420e5937496F5a2096f04caA7721cF70cc'

const tvl = async (timestamp, _block, { [chain]: block }) => {
  let calls = []
  const { output: size } = await sdk.api.abi.call({
    target: vault,
    abi: abi.getTotalLockCount,
    chain, block,
  })

  for (let i = 0; i < +size; i++)
    calls.push({ params: i })
  let { output: tokens } = await sdk.api.abi.multiCall({
    target: vault,
    abi: abi.getLock,
    calls,
    chain, block,
  })

  tokens = tokens.map(i => i.output[1])
  return sumTokensSingle({
    coreAssets: [
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
      '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
      '0x55d398326f99059ff775485246999027b3197955', // USDT token
      '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC token
    ],
    blacklist: [
      '0x602ba546a7b06e0fc7f58fd27eb6996ecc824689',
      '0x17e65e6b9b166fb8e7c59432f0db126711246bc0',
      '0xee6cacddd3a9370d87db581ee6728226883578e5',
      '0x6d163b653010740bfb41bed4bee23f94b3285cba',
      '0xb0228eb6c0b49f8265e6e161c3a987eed7471f42',
      '0x9888d3d9fbc12487259d1c82665b2ffd009936c6',
      '0x49a9f9a2271d8c5da44c57e7102aca79c222f4a9',
      '0x25f6212eb410e22956856ccb0383ec1a86fceaf9',
      '0x851b7cb21d7428fa1ed87a7c45da8048079b0a90',
      '0xb08f67c04bfdf069017365969ca19a0ae6e66b85',
      '0x4aee9d30893c5c73e5a5b8637a10d9537497f1c8',
      '0x9FBff386a9405b4C98329824418ec02b5C20976b',
    ],
    owner: vault,
    tokens,
    block, chain,
    restrictTokenPrice: true,
    skipConversion: false,
    onlyLPs: false,
    minLPRatio: 0.01,
    log_coreAssetPrices: [
      300/ 1e18,
      1/ 1e18,
      1/ 1e18,
      1/ 1e18,
    ],
    log_minTokenValue: 1e6,
  })
};

module.exports = {
  bsc: {
    tvl,
  },
}
