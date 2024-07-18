const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')
const { uniV3Export } = require('../helper/uniswapV3')
const ORACLE = "0x4AC635E92801e657F44BDEfcc7660Ea1431DF846";

async function tvl(api) {
  const logs = await getLogs2({
    api,
    factory: '0x352Cea820fAE79016490518b20f1FD4F53bC56Af',
    eventAbi: 'event SynthCreated(address indexed oracle, address indexed synth, bool long)',
    fromBlock: 20172088,
  })
  const synths = logs.map(log => log.synth)
  await api.sumTokens({ owners: [...synths, ORACLE], tokens: [ADDRESSES.null, ADDRESSES.ethereumclassic.WETC] })
  const uniTvl = uniV3Export({
    ethereumclassic: { blacklistedTokens: synths.concat(['0xf09ace63aa1345882a1ca200b7243f5786eb177b']), factory: '0xaCc703c9C8248a141113C672ea71d196E8118210', fromBlock: 20130563, }
  }).ethereumclassic.tvl

  return uniTvl(api)
}

module.exports = {
  ethereumclassic: {
    tvl,
  },
};
