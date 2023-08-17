const { getFactoryTvl } = require('../terraswap/factoryTvl')

const factory = {
  terra2: "terra1f4cr4sr5eulp3f2us8unu6qv8a5rhjltqsg7ujjx6f2mrlqh923sljwhn3",
  juno: "juno14m9rd2trjytvxvu4ldmqvru50ffxsafs8kequmfky7jh97uyqrxqs5xrnx",
  injective: "inj1x22q8lfhz7qcvtzs0dakhgx2th64l79kfye5lk",
  comdex: "comdex1gurgpv8savnfw66lckwzn4zk7fp394lpe667dhu7aw48u40lj6jswv4mft",
  chihuahua: "chihuahua1s8ehad3r9wxyk08ls2nmz8mqh4vlfmaxd2nw0crxwh04t4l5je4s8ljv0j",
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  hallmarks: [
    [1651881600, "UST depeg"],
  ]
}


Object.keys(factory).forEach(chain => {
  const contract = factory[chain]
  module.exports[chain] = { tvl: getFactoryTvl(contract) }
})