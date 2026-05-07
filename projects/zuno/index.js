const { getLogs } = require('../helper/cache/getLogs')

const config = {
    zeta: {
        fromBlock: 9119360,
        dvmFactory: '0xd2b80519a88937A412415bAF1b7Fb1855189EA36',
        dspFactory: '0x01AE7F0633E1D8d642c5A6a6d39B00A36b331C97',
        gspFactory: '0xa97c5a70Be5B81f573a688F656E7bE569B492A56',
        dppFactory: '0xC176ecf1Eae0883B2356593d1Ccd5DDEd0441eb1',
        uniswapV2Factory: '0x4E36B2e9c9c9bfDd2516cAdacF07f5adAA33EF88',
        uniswapV3Factory: '0x9f48Ddad075e569cDc70D657D3aC171e23846009',
        curveStableswapFactoryNG: '0x9b1F69bfaCF13B8f8fE2aC093C7bae93b08a9C83',
        blacklistedTokens: []
    }
 }

Object.keys(config).forEach(chain => {
  const { dvmFactory, fromBlock, dspFactory, gspFactory, dppFactory, uniswapV2Factory, uniswapV3Factory, curveStableswapFactoryNG, blacklistedTokens, } = config[chain]
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

      // Add Curve StableSwap Factory NG pools
      if (curveStableswapFactoryNG) {
        funcs.push(addCurveLogs(curveStableswapFactoryNG));
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