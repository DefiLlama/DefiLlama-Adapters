const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const { getChainTransform } = require("../helper/portedTokens")

const toAddress = data => `0x${data.slice(64 - 40 + 2, 64 + 2)}`;

const CONFIG = {
    ethereum: {
        factory: '0xa03492A9A663F04c51684A3c172FC9c4D7E02eDc',
        version: '0.5.0',
        startBlock: 13234803,
        gasToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    avax:{
        factory: '0x18aB6357f673696375018f006B86fE44F195DE1f',
        version: '0.5.1',
        startBlock: 16037331,
        gasToken: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    },
    polygon: {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.1',
        startBlock: 32245577,
        gasToken: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    },
    bsc: {
        factory: '0xb4FD0Ce108e196d0C9844c48174d4C32Cd42F7bC',
        version: '0.5.1',
        startBlock: 20928838,
        gasToken: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    },
};

async function getPools(chain, block) {
    let poolLogs;
    switch(CONFIG[chain].version) {
        case '0.5.0':
            poolLogs = await sdk.api.util.getLogs({
                target: CONFIG[chain].factory,
                topic: "AntePoolCreated(address,address)",
                keys: [],
                fromBlock: CONFIG[chain].startBlock,
                toBlock: block,
                chain: chain,
            });
            break;
        case '0.5.1':
            poolLogs = await sdk.api.util.getLogs({
                target: CONFIG[chain].factory,
                topic: "AntePoolCreated(address,address,address)",
                keys: [],
                fromBlock: CONFIG[chain].startBlock,
                toBlock: block,
                chain: chain,
            });
            break;
    }
    const pools = poolLogs.output.map(log=>toAddress(log.data));
    return pools;
}

function getTvl(chain) {
    return async (timestamp, _block, chainBlocks) => {
        if (chain === 'avalanche') chain = 'avax';
        const block = chainBlocks[chain];
        const transformAddress = await getChainTransform(chain);

        const pools = await getPools(chain, block);
        const balances = await sdk.api.eth.getBalances({
            targets: pools,
            block,
            chain: chain,
        });
        
        return {
            [transformAddress(CONFIG[chain].gasToken)]: balances.output.reduce((total, pool)=>total.plus(pool.balance), BigNumber(0)).toFixed(0)
        }
    }
}

module.exports = {
    methodology: '...',
    ethereum: {
        tvl: getTvl('ethereum'),
    },
    avax: {
        tvl: getTvl('avalanche'),
    },
    polygon: {
        tvl: getTvl('polygon'),
    },
    bsc: {
        tvl: getTvl('bsc'),
    },
}