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
            abi: capABI.Vault.availableBalance,
            target: tokens.cUSD.address,
            params: [asset]
        })),
        ...agentConfigs.map(agent => ({
            abi: capABI.SymbioticNetworkMiddleware.coverageByVault,
            target: agent.networkMiddleware,
            params: [agent.network, agent.agent, agent.vault, infra.oracle.address, api.timestamp]
        }))
    ]);
    const assetAvailableBalancesResults = results.slice(0, assetAddresses.length)
    const coverageResults = results.slice(assetAddresses.length)

    for (const [asset, availableBalance] of arrayZip(assetAddresses, assetAvailableBalancesResults)) {
        api.add(asset, availableBalance)
    }
    for (const [agent, coverage] of arrayZip(agentConfigs, coverageResults)) {
        api.add(agent.vaultCollateral, coverage[1])
    }
}

const borrowed = async (api) => {
    const infra = capConfig[chain].infra;

    const assetAddresses = await fetchAssetAddresses(api, chain)
    const agentConfigs = await fetchAgentConfigs(api, chain)

    const agentAndAsset = agentConfigs.map(({ agent }) => assetAddresses.map(asset => ({
        agent: agent,
        asset: asset,
    }))).flat()

    const results = await api.batchCall(
        agentAndAsset.map(({ agent, asset }) => ({
            abi: capABI.Lender.debt,
            target: infra.lender.address,
            params: [agent, asset]
        }))
    );

    for (const [{ asset }, debt] of arrayZip(agentAndAsset, results)) {
        api.add(asset, debt)
    }
}

const staking = async (api) => {
    const tokens = capConfig[chain].tokens;
    const stcUSD = tokens.stcUSD;
    return api.erc4626Sum({ calls: [stcUSD.address], tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' })
}

module.exports = {
    methodology: 'count the total supplied assets on capToken vaults and the total delegated assets on networks (symbiotic, eigenlayer, etc.)',
    start: 1000235,
    ethereum: {
        tvl,
        borrowed,
        staking,
    }
};
