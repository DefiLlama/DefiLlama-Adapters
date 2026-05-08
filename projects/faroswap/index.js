const { getLogs } = require('../helper/cache/getLogs')

const config = {
    pharos: {
        fromBlock: 5626000,
        dvmFactory: '0xB9319bCEe26F1A6AC7207A738B021cdEC771b30E',
        dspFactory: '0xd0aAC3c1c64038D0cd3aa11941cb002cbd865d4E',
        gspFactory: '0xD15f2D50bbf777EFD529052686d0703e498F8380',
        dppFactory: '0x02d2e6292eC57E84E183909cD0F7Ca513ADdC717',
        uniswapV2Factory: '0x18Fab7d7027E9FB33Fa90ca607439449209F7B09',
        uniswapV3Factory: '0x2c90CcB0b989afA2433F499698451a25744A552b',
        blacklistedTokens: []
    }
 }

Object.keys(config).forEach(chain => {
  const { dvmFactory, fromBlock, dspFactory, gspFactory, dppFactory, uniswapV2Factory, uniswapV3Factory, blacklistedTokens, } = config[chain]
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
      
      // Add Uniswap V2 pools
      if (uniswapV2Factory) {
        funcs.push(addUniV2Logs(uniswapV2Factory));
      }
      
      // Add Uniswap V3 pools
      if (uniswapV3Factory) {
        funcs.push(addUniV3Logs(uniswapV3Factory));
      }

      await Promise.all(funcs)

      return api.sumTokens({ ownerTokens, blacklistedTokens, permitFailure: true, })

      async function addLogs(target, eventAbi) {
        if (!target) return;
        const convert = i => [[i.baseToken, i.quoteToken], i.pool]
        let logs = await getLogs({ api, target, eventAbi, onlyArgs: true, fromBlock, });
        ownerTokens.push(...logs.map(convert))
      }

      async function addUniV2Logs(target) {
        if (!target) return;
        //   PairCreated(address indexed token0, address indexed token1, address pair, uint256 feeRate, uint256 arg4)
        const eventAbi = 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256, uint256)';
        const convert = i => [[i.token0, i.token1], i.pair]
        let logs = await getLogs({ api, target, eventAbi, onlyArgs: true, fromBlock, });
        ownerTokens.push(...logs.map(convert))
      }

      async function addUniV3Logs(target) {
        if (!target) return;
        // PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)
        const eventAbi = 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)';
        const convert = i => [[i.token0, i.token1], i.pool]
        let logs = await getLogs({ api, target, eventAbi, onlyArgs: true, fromBlock, });
        ownerTokens.push(...logs.map(convert))
      }

      async function addCurveLogs(target) {
        if (!target) return;
        // Get pool count from factory
        const poolCount = await api.call({ target, abi: 'uint256:pool_count' });
        
        // Get all pool addresses
        const poolCalls = [];
        for (let i = 0; i < poolCount; i++) {
        poolCalls.push({ target, params: [i] });
        }
        
        const poolResults = await api.multiCall({
        abi: 'function pool_list(uint256) view returns (address)',
        calls: poolCalls
        });
        
        // Get coins for each pool using factory's get_coins method
        const coinCalls = poolResults.map(pool => ({ target, params: [pool] }));
        
        const coinResults = await api.multiCall({
        abi: 'function get_coins(address _pool) view returns (address[])',
        calls: coinCalls,
        permitFailure: true
        });
        
        // Process coins for each pool
        poolResults.forEach((pool, poolIndex) => {
        const coins = coinResults[poolIndex];
        if (coins && Array.isArray(coins)) {
            ownerTokens.push([coins, pool]);
        }
        });
      }
    }
  }
})
