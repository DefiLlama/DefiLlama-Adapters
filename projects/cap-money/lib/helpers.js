const { getLogs2 } = require("../../helper/cache/getLogs");
const { capConfig, capABI, symbioticABI, eigenlayerABI } = require("./configs");
const { arrayZip } = require("./utils");

const fetchAgentConfigs = async (api, chain) => {
    const infra = capConfig[chain].infra;
    const coverageNetworkConfigs = capConfig[chain].coverageNetworkConfigs;

    const addAgentLogs = await getLogs2({
        api,
        onlyArgs: false, // need the blocknumber
        eventAbi: capABI.Delegation.AddAgentEvent,
        target: infra.delegation.address,
        fromBlock: infra.delegation.fromBlock,
        transform: (i) => ({
            agent: i.args.agent.toLowerCase(),
            networkMiddleware: i.args.network.toLowerCase(),
            fromBlock: i.blockNumber
        })
    })

    const networkConfigs = addAgentLogs.map(({ agent, networkMiddleware }) => ({
        agent: agent.toLowerCase(),
        network: coverageNetworkConfigs[networkMiddleware.toLowerCase()],
    }))

    const symbioticNetworkConfigs = networkConfigs
        .filter(({ network }) => network.type === 'symbiotic');

    const eigenlayerNetworkConfigs = networkConfigs
        .filter(({ network }) => network.type === 'eigenlayer');

    const symbioticVaults = await api.multiCall({
        abi: capABI.SymbioticNetworkMiddleware.vaults,
        calls: symbioticNetworkConfigs.map(({ agent, network }) => ({
            target: network.networkMiddleware,
            params: [agent]
        }))
    });
    const symbioticVaultsCollateral = await api.multiCall({
        abi: symbioticABI.Vault.collateral,
        calls: symbioticVaults.map((vault) => ({
            target: vault
        }))
    });

    const eigenlayerStrategies = await api.multiCall({
        abi: capABI.EigenlayerServiceManager.operatorToStrategy,
        calls: eigenlayerNetworkConfigs.map(({ agent, network }) => ({
            target: network.serviceManager,
            params: [agent],
        }))
    });
    const eigenlayerUnderlyingTokens = await api.multiCall({
        abi: eigenlayerABI.IStrategy.underlyingToken,
        calls: eigenlayerStrategies.map((strategy) => ({
            target: strategy,
        }))
    });
    const eigenlayerOperators = await api.multiCall({
        abi: capABI.EigenlayerServiceManager.getEigenOperator,
        calls: eigenlayerNetworkConfigs.map(({ agent, network }) => ({
            target: network.serviceManager,
            params: [agent],
        }))
    });

    const symbioticAgentConfigs = arrayZip(symbioticNetworkConfigs, symbioticVaults, symbioticVaultsCollateral)
        .map(([config, vault, vaultCollateral]) => ({
            ...config,
            network: {
                ...config.network,
                vault: vault.toLowerCase(),
            },
            collateralToken: vaultCollateral.toLowerCase()
        }));

    const eigenlayerAgentConfigs = arrayZip(eigenlayerNetworkConfigs, eigenlayerStrategies, eigenlayerUnderlyingTokens, eigenlayerOperators)
        .map(([config, strategy, underlyingToken, operator]) => ({
            ...config,
            network: {
                ...config.network,
                strategy: strategy.toLowerCase(),
                operator: operator.toLowerCase(),
            },
            collateralToken: underlyingToken.toLowerCase()
        }));


    const agentConfigs = [...symbioticAgentConfigs, ...eigenlayerAgentConfigs];
    return { symbioticAgentConfigs, eigenlayerAgentConfigs, agentConfigs };
}

const fetchAssetAddresses = async (api, chain) => {
    const infra = capConfig[chain].infra;
    const tokens = capConfig[chain].tokens;
    const lender = infra.lender;

    const cUSDVaultAssetAddresses = await getLogs2({
        api,
        eventAbi: capABI.Vault.AddAssetEvent,
        target: tokens.cUSD.address,
        fromBlock: tokens.cUSD.fromBlock,
        transform: (i) => i.asset.toLowerCase(),
    })

    const lenderReserveAssetAddresses = await getLogs2({
        api,
        eventAbi: capABI.Lender.ReserveAssetAddedEvent,
        target: lender.address,
        fromBlock: lender.fromBlock,
        transform: (i) => i.asset.toLowerCase(),
    })

    return [...new Set([...cUSDVaultAssetAddresses, ...lenderReserveAssetAddresses])]
}


const mapWrappedAssetBalance = (chain, address, availableBalance) => {
    const wWTGXX = capConfig.ethereum.tokens.wWTGXX;
    const WTGXX = capConfig.ethereum.tokens.WTGXX;
    if (chain === 'ethereum' && address.toLowerCase() === wWTGXX.address.toLowerCase()) {
        return [WTGXX.address, availableBalance /* same decimals, nothing to do */];
    }
    return [address, availableBalance];
}

module.exports = {
    fetchAgentConfigs,
    fetchAssetAddresses,
    mapWrappedAssetBalance,
}

