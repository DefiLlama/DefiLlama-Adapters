const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  arbitrum: [
    { "tenderSwap": "0x2429fc7082eb517c14946b392b195b181d0b9781", "steak": ADDRESSES.arbitrum.LPT, "tenderToken": "0xfac38532829fdd744373fdcd4708ab90fa0c4078" }
  ],
  ethereum: [
    { "tenderSwap": "0x7de47d1c5b9415877fe6863263f97180117fdaaa", "steak": "0x18aaa7115705e8be94bffebde57af9bfc265b998", "tenderToken": "0xc83badbf764f957acc23bc9e9aac71c298b07243" },
    { "tenderSwap": "0xf56f61f8181d118c010ca9c5f1e9e447e37b207e", "steak": "0xc944e90c64b2c07662a292be6244bdf05cda44a7", "tenderToken": "0xc29f5611dcd89bc5d3a19762783d3006bc2ad2ac" },
    { "tenderSwap": "0x23c24c1253c602106255b357cd3efe260a3a469e", "steak": ADDRESSES.ethereum.MATIC, "tenderToken": "0x2336c10a1d3100343fa9911a2c57b77c333599a3" }
  ]
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = []
      const tokensAndOwners = []
      const calls = []
      for (const { tenderToken, tenderSwap, steak } of config[chain]) {
        tokens.push(steak)
        tokensAndOwners.push([steak, tenderSwap])
        calls.push(tenderToken)
      }
      const bals = await api.multiCall({ abi: 'uint256:getTotalPooledTokens', calls })
      api.addTokens(tokens, bals)
      return api.sumTokens({ tokensAndOwners })
    }
  }
})