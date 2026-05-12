const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  pharos: {
    fromBlock: 5626000,
    dvmFactory: '0xB9319bCEe26F1A6AC7207A738B021cdEC771b30E',
    dspFactory: '0xd0aAC3c1c64038D0cd3aa11941cb002cbd865d4E',
    gspFactory: '0xD15f2D50bbf777EFD529052686d0703e498F8380',
    dppFactory: '0x02d2e6292eC57E84E183909cD0F7Ca513ADdC717',
    uniswapV2Factory: '0x18Fab7d7027E9FB33Fa90ca607439449209F7B09',
    uniswapV3Factory: '0x2c90CcB0b989afA2433F499698451a25744A552b',
  }
}

Object.keys(config).forEach(chain => {
  const { dvmFactory, fromBlock, dspFactory, gspFactory, dppFactory, uniswapV2Factory, uniswapV3Factory, blacklistedTokens, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      const funcs = [];
      const builder = async (factorys, event) => {
        if (Array.isArray(factorys)) {
          for (const factory of factorys)
            funcs.push(await addLogs(factory, event));
        } else {
          funcs.push(await addLogs(factorys, event));
        }
      }
      await builder(dvmFactory, 'event NewDVM (address baseToken, address quoteToken, address creator, address pool)');
      await builder(dspFactory, 'event NewDSP(address baseToken, address quoteToken, address creator, address pool)');
      await builder(gspFactory, 'event NewGSP(address baseToken, address quoteToken, address creator, address pool)');
      await builder(dppFactory, 'event NewDPP (address baseToken, address quoteToken, address creator, address pool)');
      await builder(uniswapV3Factory, 'event PoolCreated(address indexed baseToken, address indexed quoteToken, uint24 indexed fee, int24 tickSpacing, address pool)');

      // Add Uniswap V2 pools
      if (uniswapV2Factory) {
        const pools = await api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: uniswapV2Factory })
        const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
        const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
        for (let i = 0; i < pools.length; i++) {
          ownerTokens.push([[token0s[i], token1s[i]], pools[i]])
        }
      }

      return api.sumTokens({ ownerTokens, blacklistedTokens, permitFailure: true, })

      async function addLogs(target, eventAbi) {
        if (!target) return;

        const convert = i => ownerTokens.push([[i.baseToken, i.quoteToken], i.pool])
        let logs = await getLogs2({ api, target, eventAbi, fromBlock, });
        logs.forEach(convert)
      }
    }
  }
})
