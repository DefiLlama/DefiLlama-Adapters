const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
    base: {
        masterContract: '0x00000000000c109080dfa976923384b97165a57a',
    },

};

async function tvl(api) {
    const { masterContract } = config[api.chain];

    const totalMarkets = await api.call({
        abi: 'function createdMarkets() view returns (uint256)',
        target: masterContract,
    });

    if (totalMarkets === 0) return {};

    const marketIds = Array.from({ length: Number(totalMarkets) }, (_, i) => i);
    const marketsData = await api.multiCall({
        abi: 'function markets(uint256) view returns (string question, string resolutionCriteria, string imageURL, string category, string outcomes, address creator, address operator, address market, uint256 startTimestamp, uint256 endTimestamp, address collateral)',
        calls: marketIds.map(id => ({ target: masterContract, params: [id] })),
    });

    const tokensAndOwners = [];
    const collateralTokens = [...new Set(marketsData.map(({ collateral }) => collateral).filter(Boolean))];

    marketsData.forEach(({ collateral, market }) => {
        if (collateral && market) tokensAndOwners.push([collateral, market]);
    });

    const ownedCollateralFlags = await api.multiCall({
        abi: 'function ownedCollaterals(address) view returns (bool)',
        calls: collateralTokens.map(collateral => ({ target: masterContract, params: [collateral] })),
    });

    collateralTokens.forEach((collateral, i) => {
        if (ownedCollateralFlags[i]) tokensAndOwners.push([collateral, masterContract]);
    });

    return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
    methodology: "Counts TVL by querying all created markets from the Precog Master contract, summing collateral held in each market contract, and including owned launchpad collateral held directly by the Precog Master contract.",
    base: { tvl },
};
