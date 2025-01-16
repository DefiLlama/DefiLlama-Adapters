const { getLogs2 } = require('../helper/cache/getLogs')

const CONFIG = {
  dvm: {
    factory: '0x6694eebf40924e04c952EA8F1626d19E7a656Bb7',
    eventAbi: 'event NewDVM (address baseToken, address quoteToken, address creator, address pool)',
    fromBlock: 193478
  },
  dsp: {
    factory: '0xd0de7cA3298fff085E2cb82F8a861a0254256BA0',
    eventAbi: 'event NewDSP(address baseToken, address quoteToken, address creator, address pool)',
    fromBlock: 193478
  },
  gsp: {
    factory: '0x2235bB894b7600F1a370fc595Ee5477999A30441',
    eventAbi: 'event NewGSP(address baseToken, address quoteToken, address creator, address pool)',
    fromBlock: 193478
  },
  dpp: {
    factory: '0x297A4885a7da4AaeF340FABEd119e7a6E3f2BCe8',
    eventAbi: 'event NewDPP (address baseToken, address quoteToken, address creator, address pool)',
    fromBlock: 193478
  }
}

const getMomoLogs = async (api, configKey, config) => {
  const { factory: target, eventAbi, fromBlock } = config
  const extrakey = `momo-${api.chain}-${configKey}`
  const logs = await getLogs2({ api, extrakey, target, eventAbi, fromBlock, onlyArgs: true })
  if (!logs.length) return [];
  return logs.map(log => [[log.baseToken, log.quoteToken], log.pool]);
}

const tvl = async (api) => {
  const { dvm, dsp, gsp, dpp} = CONFIG

  const tokens = await Promise.all([
    getMomoLogs(api, 'dvm', dvm),
    getMomoLogs(api, 'dsp', dsp),
    getMomoLogs(api, 'gsp', gsp),
    getMomoLogs(api, 'dpp', dpp),
  ])

  const ownerTokens = tokens.filter(tokens => tokens.length > 0).flat()
  return api.sumTokens({ ownerTokens, permitFailure: true });
}

module.exports = {
  morph: { tvl }
}
