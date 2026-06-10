const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require("@defillama/sdk");

async function stableDexTVL(api) {
  const logs = await getLogs2({
    api,
    factory: '0xa0a1EBf6bd49e455de2302a86584FD8A0eDD3344',
    eventAbi: 'event NewSwapPool (address indexed deployer, address swapAddress, address[] pooledTokens)',
    fromBlock: 1454692,
  })
  return api.sumTokens({ ownerTokens: logs.map(i => [i.pooledTokens, i.swapAddress]) })
}

const dexTVL = getUniTVL({
  useDefaultCoreAssets: true,
  factory: '0x049581aEB6Fe262727f290165C29BDAB065a1B68',
  coreAssets: [
    '0xf50225a84382c74CbdeA10b0c176f71fc3DE0C4d', // moonriver
    "0x98878B06940aE243284CA214f92Bb71a2b032B8A", // WMOVR
    // "0xb44a9b6905af7c801311e8f4e76932ee959c663c", // usdt
    "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", // usdc
    "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", // eth
  ]
})

module.exports = {
  misrepresentedTokens: true,
  moonriver: {
    tvl: sdk.util.sumChainTvls([dexTVL, stableDexTVL,]),
  }
}
