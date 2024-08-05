const ADDRESSES = require('../helper/coreAssets.json')
const START_BLOCK = 211275856;
const config = {
    arbitrum: {
        ufarmCore: '0x46Df84E70deDB8a17eA859F1B07B00FB83b8a81F',
        valueToken: ADDRESSES.arbitrum.USDT,
    },
};

const chainedTVLs = () => {
    const result = {};
    for(const chain of Object.keys(config)) {
        result[chain] = { tvl: async (api) => {
            const END_BLOCK = await api.getBlock();
            const params = [];
            // get the list of funds
            const fundCreated = await api.getLogs({
                target: config[chain].ufarmCore,
                chain: chain,
                skipCache: true,
                fromBlock: START_BLOCK,
                toBlock: END_BLOCK,
                eventAbi: 'event FundCreated(bytes32 indexed,uint256,address)',
            });

            for (const fundLog of fundCreated) {
                const fundAddress = fundLog.args[2];
                // get the list of pools
                const poolCreated = await api.getLogs({
                    target: fundAddress,
                    chain: chain,
                    skipCache: false,
                    fromBlock: START_BLOCK,
                    toBlock: END_BLOCK,
                    eventAbi: 'event PoolCreated(string,string,uint256,uint256,uint256,uint256,uint256,uint256,address,address)',
                });
                for (const poolLog of poolCreated) {
                    const poolAddress = poolLog.args[8];
                    // collect the pool addresses
                    params.push({ target: poolAddress });
                }
            }

            // get TVL of each pool at one call
            const balances = await api.multiCall({
                abi: 'function getTotalCost() public view returns (uint256)',
                calls: params,
                block: END_BLOCK,
                skipCache: false,
            });
            api.addTokens(balances.map( b => config[chain].valueToken ), balances);
        }};
    }
    return result;
};

module.exports = {
    methodology: 'Counts the AUM of all pools registered in the UFarm Protocol',
    start: START_BLOCK,
    ...chainedTVLs()
};
