const { arrayZip } = require('./lib/utils');
const { capABI, capConfig } = require('./lib/configs')
const { fetchAssetAddresses, fetchAgentConfigs } = require('./lib/helpers')

const chain = 'ethereum';

const tvl = async (api) => {
    const tokens = capConfig[chain].tokens;
    const infra = capConfig[chain].infra;

    const assetAddresses = await fetchAssetAddresses(api, chain)
    const agentConfigs = await fetchAgentConfigs(api, chain)

    const results = await api.batchCall([
        ...assetAddresses.map(asset => ({
            abi: capABI.Vault.totalSupplies,
            target: tokens.cUSD.address,
            params: [asset]
        })),
        ...agentConfigs.map(agent => ({
            abi: capABI.SymbioticNetworkMiddleware.coverageByVault,
            target: agent.networkMiddleware,
            params: [agent.network, agent.agent, agent.vault, infra.oracle.address, api.timestamp]
        }))
    ]);
    const assetSuppliesResults = results.slice(0, assetAddresses.length)
    const coverageResults = results.slice(assetAddresses.length)

    for (const [asset, supplied] of arrayZip(assetAddresses, assetSuppliesResults)) {
        api.add(asset, supplied)
    }
    for (const [agent, coverage] of arrayZip(agentConfigs, coverageResults)) {
        api.add(agent.vaultCollateral, coverage)
    }
}

module.exports = {
    methodology: 'count the total supplied assets on capToken vaults and the total delegated assets on networks (symbiotic, eigenlayer, etc.)',
    start: 1000235,
    ethereum: {
        tvl,
    }
};
