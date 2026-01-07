const { getFactoryTvl } = require('../terraswap/factoryTvl')

const factory = {
  terra2: "terra1f4cr4sr5eulp3f2us8unu6qv8a5rhjltqsg7ujjx6f2mrlqh923sljwhn3",
  juno: "juno14m9rd2trjytvxvu4ldmqvru50ffxsafs8kequmfky7jh97uyqrxqs5xrnx",
  injective: "inj1x22q8lfhz7qcvtzs0dakhgx2th64l79kfye5lk",
  comdex: "comdex1gurgpv8savnfw66lckwzn4zk7fp394lpe667dhu7aw48u40lj6jswv4mft",
  chihuahua: "chihuahua1s8ehad3r9wxyk08ls2nmz8mqh4vlfmaxd2nw0crxwh04t4l5je4s8ljv0j",
  migaloo: "migaloo1z89funaazn4ka8vrmmw4q27csdykz63hep4ay8q2dmlspc6wtdgq92u369",
  sei: "sei1tcx434euh2aszzfsjxqzvjmc4cww54rxvfvv8v7jz353rg779l2st699q0",
  osmosis: "osmo1vuzkc4nzzav7g6t20f2vp0ed4sm3vaqnkpzy7yq3kujxs2g2hawqwnwy5w"
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  hallmarks: [
    [1651881600, "UST depeg"],
    [1676300400,"Migaloo Chain Launch"]
  ]
}

Object.keys(factory).forEach(chain => {
  const contract = factory[chain]
  if (chain === 'comdex' || chain === 'injective') {
    module.exports[chain] = { tvl: () => ({}) }
  } else {
    module.exports[chain] = { tvl: getFactoryTvl(contract) }
  }
})