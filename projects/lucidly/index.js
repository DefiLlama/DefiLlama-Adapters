const sdk = require("@defillama/sdk");
const { chainTvl } = require("../helper/boringVault");

const { boringVaultsV0Ethereum } = require("./ethereumConstants");
const { boringVaultsV0Arbitrum } = require("./arbitrumConstants");
const { boringVaultsV0Base } = require("./baseConstants");

async function legacyTvl(api) {
    const registryAddress = '0x3C2A24c9296eC8B1fdb8039C937DaC7CBca3976c';
    const pools = await api.call({
        abi: 'function getPoolAddresses() view returns (address[])',
        target: registryAddress,
    });

    const tokens = await api.fetchList({ lengthAbi: 'numTokens', itemAbi: 'tokens', calls: pools, groupedByInput: true, })
    const ownerTokens = pools.map((v, i) => [tokens[i], v]);
    const balances = await api.sumTokens({ ownerTokens });
    const numericBalances = {};
    for (const [token, amount] of Object.entries(balances)) {
        numericBalances[token] = Number(amount);
    }
    return numericBalances;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    start: 1710745200,
    doublecounted: true,
    ["ethereum"]: {
        tvl: sdk.util.sumChainTvls([
            (api) => chainTvl(api, boringVaultsV0Ethereum),
            (api) => legacyTvl(api)
        ])
    },
    ["arbitrum"]: { tvl: (api) => chainTvl(api, boringVaultsV0Arbitrum) },
    ["base"]: { tvl: (api) => chainTvl(api, boringVaultsV0Base) },
};
