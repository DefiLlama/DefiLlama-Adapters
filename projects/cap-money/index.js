const { arrayZip } = require('./lib/utils');
const { capABI, capConfig, eigenlayerABI } = require('./lib/configs')
const { fetchAssetAddresses, fetchAgentConfigs, mapWrappedAssetBalance } = require('./lib/helpers')

const chain = 'ethereum';


const ethereumTvl = async (api) => {
    const tokens = capConfig[chain].tokens;
    const infra = capConfig[chain].infra;

    const assetAddresses = await fetchAssetAddresses(api, chain)
    const { symbioticAgentConfigs, eigenlayerAgentConfigs } = await fetchAgentConfigs(api, chain)

    const assetAvailableBalancesResults = await api.multiCall({
        abi: capABI.Vault.totalSupplies,
        calls: assetAddresses.map(asset => ({
            target: tokens.cUSD.address,
            params: [asset]
        }))
    })

    const symbioticCoverage = await api.multiCall({
        abi: capABI.SymbioticNetworkMiddleware.coverageByVault,
        calls: symbioticAgentConfigs.map(({ agent, network }) => ({
            target: network.networkMiddleware,
            params: [network.network, agent, network.vault, infra.oracle.address, api.timestamp]
        }))
    })
    const eigenlayerCoverage = await api.multiCall({
        abi: eigenlayerABI.AllocationManager.getAllocatedStake,
        calls: eigenlayerAgentConfigs.map(({ network }) => ({
            target: network.allocationManager,
            params: [{ avs: network.avs, id: network.operatorSet }, [network.operator], [network.strategy]],
        }))
    })

    for (let [asset, availableBalance] of arrayZip(assetAddresses, assetAvailableBalancesResults)) {
        [asset, availableBalance] = mapWrappedAssetBalance(chain, asset, availableBalance)
        api.add(asset, availableBalance)
    }

    for (const [agent, coverage] of arrayZip(symbioticAgentConfigs, symbioticCoverage)) {
        api.add(agent.collateralToken, coverage[1])
    }

    for (const [agent, coverage] of arrayZip(eigenlayerAgentConfigs, eigenlayerCoverage)) {
        api.add(agent.collateralToken, coverage[0][0])
    }
}

const ethereumBorrowed = async (api) => {
    const infra = capConfig[chain].infra;

    const assetAddresses = await fetchAssetAddresses(api, chain)
    const { agentConfigs } = await fetchAgentConfigs(api, chain)

    const agentAndAsset = agentConfigs.map(({ agent }) => assetAddresses.map(asset => ({
        agent: agent,
        asset: asset,
    }))).flat()

    const results = await api.batchCall(
        agentAndAsset.map(({ agent, asset }) => ({
            abi: capABI.Lender.debt,
            target: infra.lender.address,
            params: [agent, asset],
            permitFailure: true
        }))
    );

    for (const [{ asset }, debt] of arrayZip(agentAndAsset, results)) {
        if (!debt) continue;
        api.add(asset, debt)
    }
}

const megaethTvl = async (api) => {
    const block = api.block;
    const megaethTokens = capConfig.megaeth;

    // Get token balances from megaeth
    const tokens = Object.values(megaethTokens).filter(token => token.fromBlock < block);
    const balances = await api.multiCall({
        abi: 'erc20:totalSupply',
        calls: tokens.map(token => ({
            target: token.address,
            params: [],
            permitFailure: true
        }))
    });

    for (let i = 0; i < tokens.length; i++) {
        api.add(tokens[i].address, balances[i]);
    }
}

module.exports = {
    methodology: 'count the total supplied assets on capToken vaults and the total delegated assets on networks (symbiotic, eigenlayer, etc.)',
    start: "2025-08-01",
    ethereum: { tvl: ethereumTvl, borrowed: ethereumBorrowed },
    megaeth: { tvl: megaethTvl }
};
