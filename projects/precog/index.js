const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');

const FUNDER_EOA_1 = '0x5D45B7d8e517eF6b7085175ed395D9c8562b952f';

const config = {
    base: {
        contracts: [
            { address: '0x1eb90323ae74e5fbc3241c1d074cfd0b117d7e8e', fromBlock: 25593661 },
            { address: '0x00000000000c109080dfa976923384b97165a57a', fromBlock: 42999625 },
        ],
        staticTokens: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
            '0x4200000000000000000000000000000000000006', // WETH
            '0xC139C86de76DF41c041A30853C3958427fA7CEbD', // MATE
        ],
    },
    arbitrum: {
        contracts: [
            { address: '0x00000000000c109080dfa976923384b97165a57a', fromBlock: 440198385 },
        ],
        staticTokens: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
        ],
    },
    ethereum: {
        contracts: [
            { address: '0x00000000000c109080dfa976923384b97165a57a', fromBlock: 24624452 },
        ],
        staticTokens: [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        ],
    },
};

async function tvl(api) {
    const { contracts, staticTokens } = config[api.chain];
    const allDiscoveredTokens = new Set();
    const marketTokenPairs = [];

    for (const { address: masterContract, fromBlock } of contracts) {
        const logs = await getLogs({
            api,
            target: masterContract,
            eventAbi: 'event MarketCreated(address indexed creator, uint256 id, address market)',
            onlyArgs: true,
            fromBlock,
        });

        const marketIds = logs.map(log => log.id);
        if (marketIds.length === 0) continue;

        const collateralInfo = await api.multiCall({
            abi: 'function marketCollateralInfo(uint256 marketId) view returns (address collateral, string name, string symbol, uint8 decimals)',
            calls: marketIds.map(id => ({
                target: masterContract,
                params: [id]
            }))
        });

        logs.forEach((log, index) => {
            const marketAddress = log.market;
            const tokenAddress = collateralInfo[index].collateral;
            if (tokenAddress && marketAddress) {
                marketTokenPairs.push([tokenAddress, marketAddress]);
                allDiscoveredTokens.add(tokenAddress);
            }
        });
    }

    await sumTokens2({ api, tokensAndOwners: marketTokenPairs });

    const funderTokens = [...new Set([...staticTokens, ...Array.from(allDiscoveredTokens)])];

    return sumTokens2({
        api,
        owners: [FUNDER_EOA_1],
        tokens: funderTokens,
    });
}

module.exports = {
    methodology: "Counts TVL by fetching all created markets from the Master contract logs, querying the collateral token for each market, and summing the balances. It also tracks these discovered tokens within the Precog Funder EOAs.",
    base: { tvl },
    arbitrum: { tvl },
    ethereum: { tvl },
};
