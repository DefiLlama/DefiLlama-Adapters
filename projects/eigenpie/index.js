const config = require("./config");

async function tvl(timestamp, block, chainBlocks, { api }) {
    const { eigenConfig, eigenStaking } = config[api.chain];

    const tokens = await api.call({
        abi: 'function getSupportedAssetList() view returns (address[] memory)',
        target: eigenConfig,
        chain: api.chain,
    });
    for (var i = 0; i < tokens?.length; i++) {
        const stackedAmount = await api.call({
            abi: 'function getTotalAssetDeposits(address) view returns (uint256)',
            target: eigenStaking,
            chain: api.chain,
            params: [tokens[i]]
        });
        api.add(tokens[i], stackedAmount)
    }
}

Object.keys(config).forEach((chain) => {
    module.exports[chain] = {
        tvl,
    };
});

module.exports.doublecounted = true