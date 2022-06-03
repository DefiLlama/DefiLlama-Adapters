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
    ],
    owner: vault,
    tokens,
    block, chain,
  })
};

module.exports = {
  bsc: {
    tvl,
  },
}
