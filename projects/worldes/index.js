const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  arbitrum: { dvmFactory: '0x3bA0388E64900e274f2C6fCfaE34Eed65c01282A', fromBlock: 228710000, dspFactory: '0xf3AadDd00C2E263d760BE52BB7142276B74E8b47', WorldesRWATokenFactory: '0x4Ef31B45919aE1874840B9563D46FCD57E2Ae0b7', WorldesDvmProxy: '0x7e93ED796aFD3D9a6e9a24c668153fBb981bE60E', WorldesDspProxy: '0xE6933Fb2dc110a43fdeC6bB83d6ae99aC557c452', WorldesMineProxy: '0x2eFda50249176e3ee1A26964Ad6496DC5aA2aCE7' },
}

Object.keys(config).forEach(chain => {
  const { dvmFactory, fromBlock, dspFactory, blacklistedTokens, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []

      await builder(dvmFactory, 'event NewDVM(address baseToken, address quoteToken, address creator, address pool)');
      await builder(dspFactory, 'event NewDSP(address baseToken, address quoteToken, address creator, address pool)');

      return api.sumTokens({ ownerTokens, blacklistedTokens, permitFailure: true, })

      async function builder(factorys, event) {
        if (!Array.isArray(factorys))
          factorys = [factorys];
        const res = factorys.map(factory => addLogs(factory, event));
        await Promise.all(res)
      }

      async function addLogs(target, eventAbi) {
        const convert = i => [[i.baseToken, i.quoteToken], i.pool]
        let logs = await getLogs2({ api, target, eventAbi, fromBlock })
        ownerTokens.push(...logs.map(convert))
      }
    }
  }
})