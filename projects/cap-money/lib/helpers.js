const { getLogs2 } = require("../../helper/cache/getLogs");
const { capConfig, capABI, symbioticABI } = require("./configs");
const { arrayZip } = require("./utils");

const fetchAgentConfigs = async (api, chain) => {
    const infra = capConfig[chain].infra;
    const networkMiddlewareToNetwork = capConfig[chain].symbiotic.networkMiddlewareToNetwork;

    const agentAndNetworkMiddleware = await getLogs2({
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

    const networks = agentAndNetworkMiddleware.map(({ networkMiddleware }) => networkMiddlewareToNetwork[networkMiddleware] ?? networkMiddlewareToNetwork.default)

    const vaults = await api.multiCall({
        abi: capABI.SymbioticNetworkMiddleware.vaults,
        calls: agentAndNetworkMiddleware.map(({ agent, networkMiddleware }) => ({
            target: networkMiddleware,
            params: [agent]
        }))
    });

    const vaultsCollateral = await api.multiCall({
        abi: symbioticABI.Vault.collateral,
        calls: vaults.map((vault) => ({
            target: vault
        }))
    });

    const agentConfigs = arrayZip(agentAndNetworkMiddleware, networks, vaults, vaultsCollateral)
        .map(([config, network, vault, vaultCollateral]) => ({
            ...config,
            network: network.toLowerCase(),
            vault: vault.toLowerCase(),
            vaultCollateral: vaultCollateral.toLowerCase()
        }));

    return agentConfigs;
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


module.exports = {
    fetchAgentConfigs,
    fetchAssetAddresses,
}

