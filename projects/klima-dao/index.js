const { staking } = require('../helper/staking')

module.exports = {
  methodology: "TVL counts the TCO2 tokens within the BCT pool. Additionally, tokens held by the DAO and within the treasury as well as the staking contracts are counted toward treasury and staking respectively.",
  polygon: {
    tvl: async (api) => {
      // If the current block is earlier than the date BCT was transferred to KlimaDAO, return 0
      if (api.timestamp < 1709828986)  return {}
      const bctAddress = "0x2F800Db0fdb5223b3C3f354886d907A671414A7F"
      const supply = await api.call({ abi: 'erc20:totalSupply', target: bctAddress, })
      api.add(bctAddress, supply)
    },
    staking: staking("0x25d28a24Ceb6F81015bB0b2007D795ACAc411b4d", "0x4e78011ce80ee02d2c3e649fb657e45898257815"),
  },
  hallmarks: [
    [1709828986, "BCT administrative control transferred to KlimaDAO"],
  ]
};