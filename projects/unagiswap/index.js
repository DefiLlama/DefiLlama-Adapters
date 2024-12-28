const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  taiko: { dvmFactory: '0x6694eebf40924e04c952EA8F1626d19E7a656Bb7', fromBlock: 452910, dspFactory: '0xd0de7cA3298fff085E2cb82F8a861a0254256BA0', gspFactory: '0x2235bB894b7600F1a370fc595Ee5477999A30441', dppFactory: '0x297A4885a7da4AaeF340FABEd119e7a6E3f2BCe8' },
 }

Object.keys(config).forEach(chain => {
  const { dvmFactory, fromBlock, dspFactory, gspFactory, dppFactory, blacklistedTokens, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      const funcs = [];
      const builder = (factorys, event) => {
        if (Array.isArray(factorys)) {
          factorys.forEach(factory => funcs.push(addLogs(factory, event)));
        } else {
          funcs.push(addLogs(factorys, event));
        }
      }
      builder(dvmFactory, 'event NewDVM (address baseToken, address quoteToken, address creator, address pool)');
      builder(dspFactory, 'event NewDSP(address baseToken, address quoteToken, address creator, address pool)');
      builder(gspFactory, 'event NewGSP(address baseToken, address quoteToken, address creator, address pool)');
      builder(dppFactory, 'event NewDPP (address baseToken, address quoteToken, address creator, address pool)');

      await Promise.all(funcs)

      return api.sumTokens({ ownerTokens, blacklistedTokens, permitFailure: true, })

      async function addLogs(target, eventAbi) {
        if (!target) return;
        const convert = i => [[i.baseToken, i.quoteToken], i.pool]
        let logs = await getLogs({ api, target, eventAbi, onlyArgs: true, fromBlock, });
        ownerTokens.push(...logs.map(convert))
      }
    }
  }
})