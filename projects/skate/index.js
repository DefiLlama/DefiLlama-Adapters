const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/solana')

const evm_config = {
    ethereum: [
        { kernelEventEmitter: '0x6984DC28Bf473160805AE0fd580bCcaB77f4bD7C', fromBlock: 22330649 }
    ],
    bsc: [
        { kernelEventEmitter: '0x6984DC28Bf473160805AE0fd580bCcaB77f4bD7C', fromBlock: 49126003 }
    ],
    base: [
        { kernelEventEmitter: '0x3dDe8E4b5120875B1359b283034F9606D0f2F9eC', fromBlock: 29522359 }
    ],
    arbitrum: [
        { kernelEventEmitter: '0x3dDe8E4b5120875B1359b283034F9606D0f2F9eC', fromBlock: 331057353 }
    ],
}

const svm_config = {
    eclipse: [
        '4wyA3MfcGu9PmFiegCZ3itNADVxmTrnKt4MDFFRxzctm' // tETH/WETH
    ],
    solana: [
        '78auJTs52UmJbn82tCptdMTgQzgTLA2hg4AS6RKnwkxQ', // USDT/USDC
        'CjfBGMQJTw4rHFCGdF5U4GMPBK7sE4x1rgatjHyqCocG' // WSOL/USDC
    ]
}

const abi = {
    "pool_created": "event PoolCreated(address kernelPool, address pool, address token0, address token1, uint24 fee)",
    "balances_available": {
        "constant": true,
        "inputs": [],
        "name": "balancesAvailable",
        "outputs": [
          {
            "name": "amount0",
            "type": "uint256"
          },
          {
            "name": "amount1",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
}

module.exports = {
    methodology: "Assets deployed on periphery chains. For EVM chains, we track the token balances in the pools. For SVM chains, we track the token balances owned by the pool addresses.",
    start: 1742169600, // '2025-03-17 GMT+0'
    timetravel: false, // Set to false for Solana and Eclipse chains
}

Object.keys(evm_config).forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            const kernelEventEmitters = evm_config[chain];
            const allLogs = [];

            for (const { kernelEventEmitter, fromBlock } of kernelEventEmitters) {
                const logs = await getLogs2({
                    api,
                    target: kernelEventEmitter.toLowerCase(),
                    eventAbi: abi.pool_created,
                    fromBlock,
                    onlyArgs: true,
                    transform: ([kernelPool, pool, token0, token1, fee]) => ({ kernelPool, pool, token0, token1, fee }),
                });

                logs.forEach((log) => allLogs.push({
                    chain,
                    kernelPool: log.kernelPool,
                    peripheryPool: log.pool,
                    token0: log.token0,
                    token1: log.token1,
                    fee: log.fee,
                }));

                const bals = await api.multiCall({ abi: abi.balances_available, calls: allLogs.map(e => e.peripheryPool) });
                bals.forEach(([amount0, amount1], i) => {
                    const { token0, token1 } = allLogs[i];
                    api.add(token0, amount0);
                    api.add(token1, amount1);
                });
            }
            return api.getBalances();
        }
    };
});

module.exports.solana = {
    tvl: async (api) => {
        const poolAddresses = svm_config.solana;
        return sumTokens2({ 
            api, 
            owners: poolAddresses,
            chain: 'solana'
        });
    }
};

module.exports.eclipse = {
    tvl: async (api) => {
        const poolAddresses = svm_config.eclipse;
        return sumTokens2({ 
            api, 
            owners: poolAddresses,
            chain: 'eclipse'
        });
    }
};
