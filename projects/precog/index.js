const { sumTokens2 } = require('../helper/unwrapLPs');

const FUNDER_EOA_1 = '0x5D45B7d8e517eF6b7085175ed395D9c8562b952f';

const config = {
    base: {
        masterContract: '0x00000000000c109080dfa976923384b97165a57a',
        staticTokens: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
            '0x4200000000000000000000000000000000000006', // WETH
            '0xC139C86de76DF41c041A30853C3958427fA7CEbD', // MATE
        ],
    },

};

async function tvl(api) {
    const { masterContract, staticTokens } = config[api.chain];

    const totalMarkets = await api.call({
        abi: 'function createdMarkets() view returns (uint256)',
        target: masterContract,
    });

    if (totalMarkets === 0) return sumTokens2({ api, owners: [FUNDER_EOA_1], tokens: staticTokens });

    const marketIds = Array.from({ length: Number(totalMarkets) }, (_, i) => i);

    const [marketsData, collateralInfo] = await Promise.all([
        api.multiCall({
            abi: 'function markets(uint256) view returns (string question, string resolutionCriteria, string imageURL, string category, string outcomes, address creator, address operator, address market, uint256 startTimestamp, uint256 endTimestamp, address collateral)',
            calls: marketIds.map(id => ({ target: masterContract, params: [id] })),
        }),
        api.multiCall({
            abi: 'function marketCollateralInfo(uint256 marketId) view returns (address token, string name, string symbol, uint8 decimals)',
            calls: marketIds.map(id => ({ target: masterContract, params: [id] })),
        }),
    ]);

    const allDiscoveredTokens = new Set(staticTokens);
    const marketTokenPairs = [];

    marketsData.forEach((data, index) => {
        const marketAddress = data.market;
        const tokenAddress = collateralInfo[index].token;
        if (tokenAddress && marketAddress) {
            marketTokenPairs.push([tokenAddress, marketAddress]);
            allDiscoveredTokens.add(tokenAddress);
        }
    });

    await sumTokens2({ api, tokensAndOwners: marketTokenPairs });

    return sumTokens2({
        api,
        owners: [FUNDER_EOA_1],
        tokens: [...allDiscoveredTokens],
    });
}

module.exports = {
    methodology: "Counts TVL by querying all created markets from the Master contract, summing collateral balances held in each market contract, and tracking collateral tokens in the Precog Funder EOA.",
    base: { tvl },
};
