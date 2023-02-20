const { getFactoryTvl } = require("../terraswap/factoryTvl");

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  terra2: {
    tvl: getFactoryTvl("terra14x9fr055x5hvr48hzy2t4q7kvjvfttsvxusa4xsdcy702mnzsvuqprer8r"),
  },
  injective: {
    tvl: getFactoryTvl("inj1x22q8lfhz7qcvtzs0dakhgx2th64l79kfye5lk"),
  },
  comdex: {
    tvl: getFactoryTvl("comdex1gurgpv8savnfw66lckwzn4zk7fp394lpe667dhu7aw48u40lj6jswv4mft",),
  },
  juno: {
    tvl: getFactoryTvl("juno14m9rd2trjytvxvu4ldmqvru50ffxsafs8kequmfky7jh97uyqrxqs5xrnx",),
  },
}
