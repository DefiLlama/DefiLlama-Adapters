const { arrayZip } = require('./lib/utils');
const { capABI, capConfig, eigenlayerABI } = require('./lib/configs')
const { fetchAssetAddresses, fetchAgentConfigs, mapWrappedAssetBalance } = require('./lib/helpers')

const chain = 'ethereum';


const ethereumTvl = async (api) => {
    const tokens = capConfig[chain].tokens;
    const infra = capConfig[chain].infra;
    const assetAddresses = await fetchAssetAddresses(api, chain)
    const { symbioticAgentConfigs, eigenlayerAgentConfigs } = await fetchAgentConfigs(api, chain)

    const [cUSDTotalSupply] = await api.multiCall({
        abi: 'erc20:totalSupply',
        calls: [tokens.cUSD.address],
    })
    api.add(tokens.cUSD.address, cUSDTotalSupply)

    const [cUSDLockboxBalance] = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: [{ target: tokens.cUSD.address, params: [infra.lz.cUSDLockbox.address] }],
    })
    api.add(tokens.cUSD.address, -cUSDLockboxBalance)

    const assetAvailableBalancesResults = await api.multiCall({
        abi: capABI.Vault.totalSupplies,
        calls: assetAddresses.map(asset => ({
            target: tokens.cUSD.address,
            params: [asset]
        }))
    })
    for (let [asset, availableBalance] of arrayZip(assetAddresses, assetAvailableBalancesResults)) {
        [asset, availableBalance] = mapWrappedAssetBalance(chain, asset, availableBalance)
        api.add(asset, availableBalance)
    }

    const symbioticCoverage = await api.multiCall({
        abi: capABI.SymbioticNetworkMiddleware.coverageByVault,
        calls: symbioticAgentConfigs.map(({ agent, network }) => ({
            target: network.networkMiddleware,
            params: [network.network, agent, network.vault, infra.oracle.address, api.timestamp]
        }))
    })
    for (const [agent, coverage] of arrayZip(symbioticAgentConfigs, symbioticCoverage)) {
        api.add(agent.collateralToken, coverage[1])
    }

    const eigenlayerCoverage = await api.multiCall({
        abi: eigenlayerABI.AllocationManager.getAllocatedStake,
        calls: eigenlayerAgentConfigs.map(({ network }) => ({
            target: network.allocationManager,
            params: [{ avs: network.avs, id: network.operatorSet }, [network.operator], [network.strategy]],
        }))
    })
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

const ethereumStaking = async (api) => {
    const tokens = capConfig[chain].tokens;
    const infra = capConfig[chain].infra;

    const [totalSupply, lockboxBalance] = await Promise.all([
        api.call({ abi: 'erc20:totalSupply', target: tokens.stcUSD.address }),
        api.call({ abi: 'erc20:balanceOf', target: tokens.stcUSD.address, params: [infra.lz.stcUSDLockbox.address] }),
    ])
    api.add(tokens.stcUSD.address, totalSupply - lockboxBalance)
}

const megaethTvl = async (api) => {
    const { cUSD } = capConfig.megaeth.tokens;

    const [balance] = await api.multiCall({
        abi: 'erc20:totalSupply',
        calls: [{ target: cUSD.address, permitFailure: true }],
        permitFailure: true
    });
    if (balance) {
        api.add(cUSD.address, balance);
    }
}

const megaethStaking = async (api) => {
    const { stcUSD } = capConfig.megaeth.tokens;

    const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: stcUSD.address, permitFailure: true });
    if (totalSupply) {
        api.add(stcUSD.address, totalSupply);
    }
}

module.exports = {
    methodology: 'count the total supplied assets on capToken vaults and the total delegated assets on networks (symbiotic, eigenlayer, etc.)',
    start: "2025-08-01",
    ethereum: { tvl: ethereumTvl, borrowed: ethereumBorrowed, staking: ethereumStaking },
    megaeth: { tvl: megaethTvl, staking: megaethStaking }
};
