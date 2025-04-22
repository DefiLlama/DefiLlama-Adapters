const { getUniTVL } = require('../helper/unknownTokens')
const { getLogs, getAddress } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const movrUniTvl = getUniTVL({ factory: '0x6B6071Ccc534fcee7B699aAb87929fAF8806d5bd', useDefaultCoreAssets: true, })
const bscUniTvl = getUniTVL({ factory: '0x18b7f6A60d5BEE3c3a953A3f213eEa25F7eF43E9', useDefaultCoreAssets: true, })

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: '0x09f8E0aeA93Bcb511276A166e6e57E02e5cc1E0a',
    topics: ['0xab83557b3a718996d408afe08287d09bafed3590c7ae61a430d518d3199d4590'],
    fromBlock: 3587214,
    onlyUseExistingCache: true
  })
  const tokens = logs.map(i => i.topics.slice(1).map(getAddress))
  const pools = logs.map(i => '0x' + i.data.slice(154, 194))

  return sumTokens2({ api, ownerTokens: tokens.map((v, i) => ([v, pools[i]])) })
}


async function bscTvl(api) {
  const logs = await getLogs({
    api,
    target: '0x05d5E46F9d17591f7eaCdfE43E3d6a8F789Df698',
    topics: ["0xab83557b3a718996d408afe08287d09bafed3590c7ae61a430d518d3199d4590"],
    fromBlock: 25836698,
    onlyUseExistingCache: true
  })

  const tokens = logs.map(i => i.topics.slice(1).map(getAddress))
  const pools = logs.map(i => '0x' + i.data.slice(154, 194))

  return sumTokens2({ api, ownerTokens: tokens.map((v, i) => ([v, pools[i]])) })
}

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2023-03-18')/1e3), 'Protocol was hacked for 350k'],
  ],
  deadFrom: '2023-03-26',
  moonriver: {
    tvl: sdk.util.sumChainTvls([tvl, movrUniTvl]),
  },
  bsc: {
    tvl: sdk.util.sumChainTvls([bscTvl, bscUniTvl]),
  }
};
