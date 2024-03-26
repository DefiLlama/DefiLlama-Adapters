const { sumTokens2, sumTokensExport } = require("../helper/unwrapLPs");
const { getLogs } = require('../helper/cache/getLogs')


const config = {
  arbitrum: { factory: '0xA91680161fBCeA942e164B42445aD6130D01541F', stakingContract: '0x3C77EEB8eC4716a6389a522eD590FbbD261ABE8e', EQU: '0x87AAfFdF26c6885f6010219208D5B161ec7609c0' },
}

module.exports = {
  methodology: "Count the tokens in different pools in the equation.",
}

Object.keys(config).forEach(chain => {
  const { factory, EQU, stakingContract, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event PoolCreated(address indexed pool, address indexed token, address indexed usd)',
        onlyArgs: true,
        fromBlock: 142245092,
      })
      const ownerTokens = logs.map(i => [[i.usd], i.pool])
      return sumTokens2({ api, ownerTokens, })
    },
    pool2: sumTokensExport({ resolveUniV3: true, owner: stakingContract }),
    staking: sumTokensExport({ owner: stakingContract, tokens: [EQU] }),
  }
})

