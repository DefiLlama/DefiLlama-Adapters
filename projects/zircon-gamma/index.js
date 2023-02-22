const { getUniTVL } = require('../helper/unknownTokens')
const { getLogs, getAddress } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const uniTvl = getUniTVL({ chain: 'moonriver', factory: '0x6B6071Ccc534fcee7B699aAb87929fAF8806d5bd', useDefaultCoreAssets: true, })

async function tvl(_, _b, _cb, { api, }) {
  const logs = await getLogs({
    api,
    target: '0x09f8E0aeA93Bcb511276A166e6e57E02e5cc1E0a',
    topics: ['0xab83557b3a718996d408afe08287d09bafed3590c7ae61a430d518d3199d4590'],
    fromBlock: 3587214,
  })

  const tokens = logs.map(i => i.topics.slice(1).map(getAddress))
  const pools = logs.map(i => '0x' + i.data.slice(154, 194))

  return sumTokens2({ api, ownerTokens: tokens.map((v, i) => ([v, pools[i]])) })
}

module.exports = {
  misrepresentedTokens: true,
  moonriver: {
    tvl: sdk.util.sumChainTvls([tvl, uniTvl]),
  },
};
